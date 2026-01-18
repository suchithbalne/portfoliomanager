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

export const PortfolioProvider = ({ children }) => {
    const [holdings, setHoldings] = useState([]);
    const [portfolioName, setPortfolioName] = useState('My Portfolio');

    // Load from localStorage on mount
    useEffect(() => {
        const savedHoldings = localStorage.getItem('portfolio_holdings');
        const savedName = localStorage.getItem('portfolio_name');

        if (savedHoldings) {
            try {
                setHoldings(JSON.parse(savedHoldings));
            } catch (error) {
                console.error('Error loading saved portfolio:', error);
            }
        }

        if (savedName) {
            setPortfolioName(savedName);
        }
    }, []);

    // Save to localStorage when holdings change
    useEffect(() => {
        if (holdings.length > 0) {
            localStorage.setItem('portfolio_holdings', JSON.stringify(holdings));
        }
    }, [holdings]);

    // Save portfolio name
    useEffect(() => {
        localStorage.setItem('portfolio_name', portfolioName);
    }, [portfolioName]);

    const importHoldings = (newHoldings) => {
        setHoldings(newHoldings);
    };

    const clearPortfolio = () => {
        setHoldings([]);
        setPortfolioName('My Portfolio');
        localStorage.removeItem('portfolio_holdings');
        localStorage.removeItem('portfolio_name');
    };

    const updateHolding = (symbol, updates) => {
        setHoldings(prev =>
            prev.map(holding =>
                holding.symbol === symbol
                    ? { ...holding, ...updates }
                    : holding
            )
        );
    };

    const removeHolding = (symbol) => {
        setHoldings(prev => prev.filter(holding => holding.symbol !== symbol));
    };

    const value = {
        holdings,
        portfolioName,
        setPortfolioName,
        importHoldings,
        clearPortfolio,
        updateHolding,
        removeHolding,
        hasPortfolio: holdings.length > 0,
    };

    return (
        <PortfolioContext.Provider value={value}>
            {children}
        </PortfolioContext.Provider>
    );
};
