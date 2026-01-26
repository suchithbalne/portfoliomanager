'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const PortfolioContext = createContext();

export const usePortfolio = () => {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolio must be used within PortfolioProvider');
    }
    return context;
};

// Generate unique portfolio ID
const generatePortfolioId = () => {
    return `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Migrate old single-portfolio data to new multi-portfolio structure
const migrateOldData = () => {
    const oldHoldings = localStorage.getItem('portfolio_holdings');
    const oldName = localStorage.getItem('portfolio_name');

    if (oldHoldings && !localStorage.getItem('portfolios')) {
        const portfolioId = generatePortfolioId();
        const newStructure = {
            portfolios: [{
                id: portfolioId,
                name: oldName || 'My Portfolio',
                accountType: 'Taxable',
                createdAt: new Date().toISOString(),
                holdings: JSON.parse(oldHoldings)
            }],
            activePortfolioId: portfolioId,
            viewMode: 'individual',
            settings: {
                defaultView: 'individual'
            }
        };

        localStorage.setItem('portfolios', JSON.stringify(newStructure));
        localStorage.removeItem('portfolio_holdings');
        localStorage.removeItem('portfolio_name');

        return newStructure;
    }

    return null;
};

export const PortfolioProvider = ({ children }) => {
    const [portfolios, setPortfolios] = useState([]);
    const [activePortfolioId, setActivePortfolioId] = useState(null);
    const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'consolidated'

    // Load portfolios from localStorage on mount
    useEffect(() => {
        // Try to migrate old data first
        const migrated = migrateOldData();

        if (migrated) {
            setPortfolios(migrated.portfolios);
            setActivePortfolioId(migrated.activePortfolioId);
            setViewMode(migrated.viewMode);
        } else {
            const savedData = localStorage.getItem('portfolios');
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    setPortfolios(data.portfolios || []);
                    setActivePortfolioId(data.activePortfolioId);
                    setViewMode(data.viewMode || 'individual');
                } catch (error) {
                    console.error('Error loading portfolios:', error);
                }
            }
        }
    }, []);

    // Save to localStorage when portfolios change
    useEffect(() => {
        if (portfolios.length > 0) {
            const data = {
                portfolios,
                activePortfolioId,
                viewMode,
                settings: {
                    defaultView: viewMode
                }
            };
            localStorage.setItem('portfolios', JSON.stringify(data));
        }
    }, [portfolios, activePortfolioId, viewMode]);

    // Get active portfolio
    const getActivePortfolio = () => {
        return portfolios.find(p => p.id === activePortfolioId);
    };

    // Get holdings based on view mode
    const getHoldings = () => {
        if (viewMode === 'consolidated') {
            return getConsolidatedHoldings();
        }
        const activePortfolio = getActivePortfolio();
        return activePortfolio ? activePortfolio.holdings : [];
    };

    // Consolidate holdings from all portfolios
    const getConsolidatedHoldings = () => {
        const consolidatedMap = new Map();

        portfolios.forEach(portfolio => {
            portfolio.holdings.forEach(holding => {
                const key = holding.symbol;
                if (consolidatedMap.has(key)) {
                    const existing = consolidatedMap.get(key);
                    // Merge holdings with same symbol
                    const totalQuantity = existing.quantity + holding.quantity;
                    const totalCost = existing.totalCost + holding.totalCost;
                    const totalValue = existing.marketValue + holding.marketValue;

                    consolidatedMap.set(key, {
                        ...existing,
                        quantity: totalQuantity,
                        totalCost: totalCost,
                        marketValue: totalValue,
                        costBasis: totalCost / totalQuantity,
                        currentPrice: totalValue / totalQuantity,
                        gainLoss: totalValue - totalCost,
                        gainLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
                        portfolios: [...(existing.portfolios || [existing.portfolioId]), portfolio.id]
                    });
                } else {
                    consolidatedMap.set(key, {
                        ...holding,
                        portfolioId: portfolio.id,
                        portfolioName: portfolio.name
                    });
                }
            });
        });

        return Array.from(consolidatedMap.values());
    };

    // Add new portfolio
    const addPortfolio = (name, accountType, holdings, market = 'US') => {
        const newPortfolio = {
            id: generatePortfolioId(),
            name,
            accountType,
            market, // Market identifier (US, INDIA, etc.)
            createdAt: new Date().toISOString(),
            holdings
        };

        setPortfolios(prev => [...prev, newPortfolio]);
        setActivePortfolioId(newPortfolio.id);
        return newPortfolio.id;
    };

    // Update portfolio
    const updatePortfolio = (portfolioId, updates) => {
        setPortfolios(prev =>
            prev.map(p => p.id === portfolioId ? { ...p, ...updates } : p)
        );
    };

    // Delete portfolio
    const deletePortfolio = (portfolioId) => {
        setPortfolios(prev => {
            const filtered = prev.filter(p => p.id !== portfolioId);

            // If deleting active portfolio, switch to first available
            if (portfolioId === activePortfolioId && filtered.length > 0) {
                setActivePortfolioId(filtered[0].id);
            } else if (filtered.length === 0) {
                setActivePortfolioId(null);
            }

            return filtered;
        });
    };

    // Switch active portfolio
    const switchPortfolio = (portfolioId) => {
        setActivePortfolioId(portfolioId);
        setViewMode('individual');
    };

    // Import holdings (legacy support - creates new portfolio)
    const importHoldings = (holdings, name = 'Imported Portfolio', accountType = 'Taxable') => {
        addPortfolio(name, accountType, holdings);
    };

    // Clear all portfolios
    const clearAllPortfolios = () => {
        setPortfolios([]);
        setActivePortfolioId(null);
        setViewMode('individual');
        localStorage.removeItem('portfolios');
    };

    // Toggle view mode
    const toggleViewMode = () => {
        setViewMode(prev => prev === 'individual' ? 'consolidated' : 'individual');
    };

    // Get portfolio breakdown for consolidated view
    const getPortfolioBreakdown = () => {
        return portfolios.map(portfolio => {
            const totalValue = portfolio.holdings.reduce((sum, h) => sum + h.marketValue, 0);
            const totalCost = portfolio.holdings.reduce((sum, h) => sum + h.totalCost, 0);
            const gainLoss = totalValue - totalCost;

            return {
                id: portfolio.id,
                name: portfolio.name,
                accountType: portfolio.accountType,
                market: portfolio.market,
                totalValue,
                totalCost,
                gainLoss,
                gainLossPercent: totalCost > 0 ? (gainLoss / totalCost) * 100 : 0,
                holdingsCount: portfolio.holdings.length
            };
        });
    };

    const value = {
        // State
        portfolios,
        activePortfolioId,
        viewMode,

        // Getters
        holdings: getHoldings(),
        activePortfolio: getActivePortfolio(),
        hasPortfolio: portfolios.length > 0,
        portfolioCount: portfolios.length,

        // Portfolio data
        portfolios,

        // Portfolio management
        addPortfolio,
        updatePortfolio,
        deletePortfolio,
        switchPortfolio,
        importHoldings, // Legacy support

        // View management
        setViewMode,
        toggleViewMode,

        // Consolidated view
        getConsolidatedHoldings,
        getPortfolioBreakdown,

        // Utilities
        clearAllPortfolios,
    };

    return (
        <PortfolioContext.Provider value={value}>
            {children}
        </PortfolioContext.Provider>
    );
};
