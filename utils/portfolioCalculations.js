/**
 * Calculate total portfolio value
 */
export const calculateTotalValue = (holdings) => {
    return holdings.reduce((total, holding) => total + holding.marketValue, 0);
};

/**
 * Calculate total cost basis
 */
export const calculateTotalCost = (holdings) => {
    return holdings.reduce((total, holding) => total + holding.totalCost, 0);
};

/**
 * Calculate total gain/loss
 */
export const calculateTotalGainLoss = (holdings) => {
    const totalValue = calculateTotalValue(holdings);
    const totalCost = calculateTotalCost(holdings);
    return totalValue - totalCost;
};

/**
 * Calculate total return percentage
 */
export const calculateTotalReturn = (holdings) => {
    const totalCost = calculateTotalCost(holdings);
    const gainLoss = calculateTotalGainLoss(holdings);
    return totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
};

/**
 * Get best performing holding
 */
export const getBestPerformer = (holdings) => {
    if (holdings.length === 0) return null;
    return holdings.reduce((best, current) =>
        current.gainLossPercent > best.gainLossPercent ? current : best
    );
};

/**
 * Get worst performing holding
 */
export const getWorstPerformer = (holdings) => {
    if (holdings.length === 0) return null;
    return holdings.reduce((worst, current) =>
        current.gainLossPercent < worst.gainLossPercent ? current : worst
    );
};

/**
 * Calculate average return
 */
export const calculateAverageReturn = (holdings) => {
    if (holdings.length === 0) return 0;
    const totalReturn = holdings.reduce((sum, holding) => sum + holding.gainLossPercent, 0);
    return totalReturn / holdings.length;
};

/**
 * Calculate portfolio volatility (standard deviation of returns)
 */
export const calculateVolatility = (holdings) => {
    if (holdings.length === 0) return 0;

    const avgReturn = calculateAverageReturn(holdings);
    const squaredDiffs = holdings.map(holding =>
        Math.pow(holding.gainLossPercent - avgReturn, 2)
    );
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / holdings.length;
    return Math.sqrt(variance);
};

/**
 * Calculate diversification by asset type
 */
export const calculateAssetAllocation = (holdings) => {
    const allocation = {};
    const totalValue = calculateTotalValue(holdings);

    holdings.forEach(holding => {
        const type = holding.assetType || 'Unknown';
        if (!allocation[type]) {
            allocation[type] = { value: 0, percentage: 0, count: 0 };
        }
        allocation[type].value += holding.marketValue;
        allocation[type].count += 1;
    });

    // Calculate percentages
    Object.keys(allocation).forEach(type => {
        allocation[type].percentage = (allocation[type].value / totalValue) * 100;
    });

    return allocation;
};

/**
 * Calculate diversification by sector
 */
export const calculateSectorAllocation = (holdings) => {
    const allocation = {};
    const totalValue = calculateTotalValue(holdings);

    holdings.forEach(holding => {
        const sector = holding.sector || 'Unknown';
        if (!allocation[sector]) {
            allocation[sector] = { value: 0, percentage: 0, count: 0 };
        }
        allocation[sector].value += holding.marketValue;
        allocation[sector].count += 1;
    });

    // Calculate percentages
    Object.keys(allocation).forEach(sector => {
        allocation[sector].percentage = (allocation[sector].value / totalValue) * 100;
    });

    return allocation;
};

/**
 * Calculate concentration risk (percentage of top holdings)
 */
export const calculateConcentrationRisk = (holdings, topN = 5) => {
    if (holdings.length === 0) return 0;

    const totalValue = calculateTotalValue(holdings);
    const sortedHoldings = [...holdings].sort((a, b) => b.marketValue - a.marketValue);
    const topHoldings = sortedHoldings.slice(0, topN);
    const topValue = topHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);

    return (topValue / totalValue) * 100;
};

/**
 * Calculate diversification score (0-100, higher is better)
 */
export const calculateDiversificationScore = (holdings) => {
    if (holdings.length === 0) return 0;

    const assetAllocation = calculateAssetAllocation(holdings);
    const sectorAllocation = calculateSectorAllocation(holdings);
    const concentrationRisk = calculateConcentrationRisk(holdings);

    // Score based on number of different assets and sectors
    const assetTypeCount = Object.keys(assetAllocation).length;
    const sectorCount = Object.keys(sectorAllocation).length;

    // Penalize high concentration
    const concentrationPenalty = Math.min(concentrationRisk / 2, 50);

    // Reward diversity
    const diversityBonus = Math.min((assetTypeCount * 10) + (sectorCount * 5), 50);

    return Math.max(0, Math.min(100, diversityBonus + (50 - concentrationPenalty)));
};

/**
 * Calculate risk score (0-100, higher is riskier)
 */
export const calculateRiskScore = (holdings) => {
    if (holdings.length === 0) return 0;

    const volatility = calculateVolatility(holdings);
    const concentrationRisk = calculateConcentrationRisk(holdings);
    const assetAllocation = calculateAssetAllocation(holdings);

    // Higher risk for crypto and individual stocks
    let assetRisk = 0;
    if (assetAllocation['Crypto']) {
        assetRisk += assetAllocation['Crypto'].percentage * 0.5;
    }
    if (assetAllocation['Stock']) {
        assetRisk += assetAllocation['Stock'].percentage * 0.2;
    }

    // Combine factors
    const volatilityScore = Math.min(volatility, 50);
    const concentrationScore = Math.min(concentrationRisk / 2, 25);
    const assetScore = Math.min(assetRisk, 25);

    return Math.min(100, volatilityScore + concentrationScore + assetScore);
};

/**
 * Identify tax loss harvesting opportunities
 */
export const identifyTaxLossOpportunities = (holdings) => {
    return holdings.filter(holding => holding.gainLoss < 0).map(holding => ({
        ...holding,
        potentialTaxSavings: Math.abs(holding.gainLoss) * 0.25, // Assuming 25% tax rate
    })).sort((a, b) => a.gainLoss - b.gainLoss);
};

/**
 * Calculate short-term vs long-term gains
 */
export const calculateGainsByHoldingPeriod = (holdings) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const shortTerm = { gains: 0, losses: 0, count: 0 };
    const longTerm = { gains: 0, losses: 0, count: 0 };

    holdings.forEach(holding => {
        const purchaseDate = new Date(holding.purchaseDate);
        const isLongTerm = purchaseDate < oneYearAgo;

        if (isLongTerm) {
            longTerm.count++;
            if (holding.gainLoss > 0) {
                longTerm.gains += holding.gainLoss;
            } else {
                longTerm.losses += Math.abs(holding.gainLoss);
            }
        } else {
            shortTerm.count++;
            if (holding.gainLoss > 0) {
                shortTerm.gains += holding.gainLoss;
            } else {
                shortTerm.losses += Math.abs(holding.gainLoss);
            }
        }
    });

    return { shortTerm, longTerm };
};

/**
 * Identify dividend-paying stocks (simplified - in real app would need API)
 */
export const identifyDividendHoldings = (holdings) => {
    // Common dividend-paying stocks and ETFs
    const knownDividendPayers = {
        'AAPL': 0.24, 'MSFT': 0.68, 'JNJ': 1.13, 'JPM': 1.00, 'VOO': 1.38, 'VTI': 1.27,
        'KO': 1.76, 'PG': 0.94, 'T': 1.11, 'VZ': 0.64, 'XOM': 3.52, 'CVX': 3.48,
    };

    return holdings.filter(holding => knownDividendPayers[holding.symbol]).map(holding => ({
        ...holding,
        estimatedAnnualDividend: (knownDividendPayers[holding.symbol] / 100) * holding.currentPrice * holding.quantity,
        dividendYield: knownDividendPayers[holding.symbol],
    }));
};

/**
 * Format currency
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

/**
 * Format percentage
 */
export const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

/**
 * Format large numbers
 */
export const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};
