/**
 * Advanced Portfolio Risk and Diversification Calculations
 * Using proven financial formulas
 * 
 * Note: Some calculations require real-time market data (beta, correlations, historical prices)
 * which would typically come from a financial data API. We use reasonable estimates where needed.
 */

// Constants
const RISK_FREE_RATE = 0.045; // 4.5% (current US Treasury rate)
const MARKET_BETA = 1.0;
const TRADING_DAYS_PER_YEAR = 252;

// Estimated betas for common stocks (would come from API in production)
const ESTIMATED_BETAS = {
    // Tech stocks (typically higher beta)
    'AAPL': 1.2, 'MSFT': 1.1, 'GOOGL': 1.05, 'AMZN': 1.3, 'META': 1.25,
    'NVDA': 1.6, 'TSLA': 2.0, 'AMD': 1.7, 'NFLX': 1.3,

    // Defensive stocks (lower beta)
    'JNJ': 0.7, 'PG': 0.6, 'KO': 0.6, 'WMT': 0.7, 'PFE': 0.8,

    // Financial (moderate beta)
    'JPM': 1.15, 'BAC': 1.25, 'GS': 1.3, 'V': 1.0, 'MA': 1.0,

    // Energy (higher beta)
    'XOM': 1.1, 'CVX': 1.05,

    // ETFs (market beta)
    'SPY': 1.0, 'VOO': 1.0, 'VTI': 1.0, 'QQQ': 1.1,

    // Default for unknown stocks
    'DEFAULT': 1.0
};

/**
 * 1. Portfolio Beta (Market Risk)
 * β_portfolio = Σ(weight_i × beta_i)
 */
export const calculatePortfolioBeta = (holdings) => {
    if (holdings.length === 0) return 1.0;

    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    const weightedBeta = holdings.reduce((sum, holding) => {
        const weight = holding.marketValue / totalValue;
        const beta = ESTIMATED_BETAS[holding.symbol] || ESTIMATED_BETAS.DEFAULT;
        return sum + (weight * beta);
    }, 0);

    return weightedBeta;
};

/**
 * 2. Portfolio Volatility (Simplified without correlation matrix)
 * Note: Full formula requires correlation matrix between all stock pairs
 * This is a simplified version using average correlation assumption
 */
export const calculatePortfolioVolatility = (holdings) => {
    if (holdings.length === 0) return 0;

    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const avgCorrelation = 0.5; // Typical stock correlation (would calculate from data)

    // Individual volatilities based on returns
    const avgReturn = holdings.reduce((sum, h) => sum + h.gainLossPercent, 0) / holdings.length;

    let variance = 0;
    holdings.forEach((h1, i) => {
        const weight1 = h1.marketValue / totalValue;
        const vol1 = Math.abs(h1.gainLossPercent - avgReturn);

        holdings.forEach((h2, j) => {
            const weight2 = h2.marketValue / totalValue;
            const vol2 = Math.abs(h2.gainLossPercent - avgReturn);
            const correlation = i === j ? 1.0 : avgCorrelation;

            variance += weight1 * weight2 * vol1 * vol2 * correlation;
        });
    });

    return Math.sqrt(variance);
};

/**
 * 3. Sharpe Ratio (Risk-Adjusted Return)
 * Sharpe = (Portfolio_Return - Risk_Free_Rate) / σ_portfolio
 */
export const calculateSharpeRatio = (holdings) => {
    if (holdings.length === 0) return 0;

    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const portfolioReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) : 0;

    const volatility = calculatePortfolioVolatility(holdings);

    if (volatility === 0) return 0;

    return (portfolioReturn - RISK_FREE_RATE) / (volatility / 100);
};

/**
 * 4. Value at Risk (VaR) - 95% confidence
 * VaR_95% = 1.645 × σ_portfolio × √days
 */
export const calculateVaR = (holdings, days = 1, confidence = 0.95) => {
    const volatility = calculatePortfolioVolatility(holdings);
    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    // Z-scores for different confidence levels
    const zScores = {
        0.90: 1.282,
        0.95: 1.645,
        0.99: 2.326
    };

    const zScore = zScores[confidence] || 1.645;
    const dailyVol = volatility / Math.sqrt(TRADING_DAYS_PER_YEAR);

    return zScore * (dailyVol / 100) * totalValue * Math.sqrt(days);
};

/**
 * 5. Overall Risk Score (0-100 scale)
 * Risk_Score = (β_portfolio/2 × 50) + (σ_portfolio/0.5 × 50)
 */
export const calculateRiskScore = (holdings) => {
    if (holdings.length === 0) return 0;

    const beta = calculatePortfolioBeta(holdings);
    const volatility = calculatePortfolioVolatility(holdings);

    // Normalize beta (assuming max beta of 2.0)
    const betaScore = Math.min((beta / 2.0) * 50, 50);

    // Normalize volatility (assuming max volatility of 50%)
    const volScore = Math.min((volatility / 50) * 50, 50);

    return Math.min(100, betaScore + volScore);
};

/**
 * DIVERSIFICATION FORMULAS
 */

/**
 * 1. Herfindahl-Hirschman Index (HHI) - Concentration
 * HHI = Σ(weight_i²)
 */
export const calculateHHI = (holdings) => {
    if (holdings.length === 0) return 1.0;

    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    return holdings.reduce((sum, holding) => {
        const weight = holding.marketValue / totalValue;
        return sum + (weight * weight);
    }, 0);
};

/**
 * 2. Effective Number of Stocks
 * N_effective = 1 / HHI
 */
export const calculateEffectiveStocks = (holdings) => {
    const hhi = calculateHHI(holdings);
    return hhi > 0 ? 1 / hhi : 0;
};

/**
 * 3. Sector Diversification Ratio
 * Sector_Ratio = Number_of_Unique_Sectors / Total_Number_of_Stocks
 */
export const calculateSectorDiversificationRatio = (holdings) => {
    if (holdings.length === 0) return 0;

    const uniqueSectors = new Set(holdings.map(h => h.sector || 'Unknown'));
    return uniqueSectors.size / holdings.length;
};

/**
 * 4. Average Correlation (Simplified)
 * Note: Full calculation requires correlation matrix from historical data
 */
export const calculateAverageCorrelation = (holdings) => {
    // Simplified: estimate based on sector overlap
    const sectors = {};
    holdings.forEach(h => {
        const sector = h.sector || 'Unknown';
        sectors[sector] = (sectors[sector] || 0) + 1;
    });

    // More stocks in same sector = higher correlation
    const sectorConcentration = Math.max(...Object.values(sectors)) / holdings.length;
    return 0.3 + (sectorConcentration * 0.4); // Range: 0.3-0.7
};

/**
 * 5. Diversification Score (0-100 scale)
 */
export const calculateDiversificationScore = (holdings) => {
    if (holdings.length === 0) return 0;

    const n = holdings.length;
    const hhi = calculateHHI(holdings);

    // Step 1: Normalize HHI
    const perfectDiversification = 1 / n;
    const hhi_normalized = 100 * (1 - (hhi - perfectDiversification) / (1 - perfectDiversification));

    // Step 2: Sector bonus
    const uniqueSectors = new Set(holdings.map(h => h.sector || 'Unknown')).size;
    const sectorBonus = (uniqueSectors / n) * 20;

    // Step 3: Correlation penalty
    const avgCorrelation = calculateAverageCorrelation(holdings);
    const correlationPenalty = avgCorrelation * 20;

    // Step 4: Final score
    const score = hhi_normalized + sectorBonus - correlationPenalty;

    return Math.max(0, Math.min(100, score));
};

/**
 * ADDITIONAL METRICS
 */

/**
 * Maximum Drawdown (Simplified - would need historical prices)
 */
export const calculateMaxDrawdown = (holdings) => {
    // Simplified: use current unrealized losses as proxy
    const losses = holdings.filter(h => h.gainLoss < 0);
    if (losses.length === 0) return 0;

    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const totalLosses = losses.reduce((sum, h) => sum + Math.abs(h.gainLoss), 0);

    return (totalLosses / (totalValue + totalLosses)) * 100;
};

/**
 * Sortino Ratio (Downside Risk Only)
 * Sortino = (Portfolio_Return - Risk_Free_Rate) / Downside_Deviation
 */
export const calculateSortinoRatio = (holdings) => {
    if (holdings.length === 0) return 0;

    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const portfolioReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) : 0;

    // Downside deviation (only negative returns)
    const negativeReturns = holdings.filter(h => h.gainLossPercent < 0);
    if (negativeReturns.length === 0) return portfolioReturn > RISK_FREE_RATE ? 999 : 0;

    const downsideDeviation = Math.sqrt(
        negativeReturns.reduce((sum, h) => sum + Math.pow(h.gainLossPercent, 2), 0) / negativeReturns.length
    );

    if (downsideDeviation === 0) return 0;

    return (portfolioReturn - RISK_FREE_RATE) / (downsideDeviation / 100);
};

/**
 * Treynor Ratio (Return per Unit of Systematic Risk)
 * Treynor = (Portfolio_Return - Risk_Free_Rate) / β_portfolio
 */
export const calculateTreynorRatio = (holdings) => {
    if (holdings.length === 0) return 0;

    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const portfolioReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) : 0;

    const beta = calculatePortfolioBeta(holdings);

    if (beta === 0) return 0;

    return (portfolioReturn - RISK_FREE_RATE) / beta;
};

/**
 * Get comprehensive risk metrics
 */
export const getComprehensiveRiskMetrics = (holdings) => {
    return {
        beta: calculatePortfolioBeta(holdings),
        volatility: calculatePortfolioVolatility(holdings),
        sharpeRatio: calculateSharpeRatio(holdings),
        sortinoRatio: calculateSortinoRatio(holdings),
        treynorRatio: calculateTreynorRatio(holdings),
        var95_1day: calculateVaR(holdings, 1, 0.95),
        var99_1day: calculateVaR(holdings, 1, 0.99),
        maxDrawdown: calculateMaxDrawdown(holdings),
        riskScore: calculateRiskScore(holdings)
    };
};

/**
 * Get comprehensive diversification metrics
 */
export const getComprehensiveDiversificationMetrics = (holdings) => {
    return {
        hhi: calculateHHI(holdings),
        effectiveStocks: calculateEffectiveStocks(holdings),
        sectorRatio: calculateSectorDiversificationRatio(holdings),
        avgCorrelation: calculateAverageCorrelation(holdings),
        diversificationScore: calculateDiversificationScore(holdings)
    };
};
