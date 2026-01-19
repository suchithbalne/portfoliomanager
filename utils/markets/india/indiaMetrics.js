// Indian Market Specific Metrics and Calculations

/**
 * Indian stock sector mappings
 * Maps common Indian company names/symbols to sectors
 */
export const indianSectorMap = {
    // IT & Software
    'TCS': 'Information Technology',
    'INFY': 'Information Technology',
    'WIPRO': 'Information Technology',
    'HCLTECH': 'Information Technology',
    'TECHM': 'Information Technology',
    'KPIT': 'Information Technology',

    // Financial Services
    'HDFCBANK': 'Financial Services',
    'ICICIBANK': 'Financial Services',
    'SBIN': 'Financial Services',
    'AXISBANK': 'Financial Services',
    'KOTAKBANK': 'Financial Services',
    'BAJFINANCE': 'Financial Services',
    'CDSL': 'Financial Services',

    // Pharmaceuticals & Healthcare
    'SUNPHARMA': 'Pharmaceuticals',
    'DRREDDY': 'Pharmaceuticals',
    'CIPLA': 'Pharmaceuticals',
    'DIVISLAB': 'Pharmaceuticals',
    'FORTIS': 'Healthcare',
    'APOLLOHOSP': 'Healthcare',
    'KIMS': 'Healthcare',
    'ERIS': 'Pharmaceuticals',

    // Automobile
    'MARUTI': 'Automobile',
    'TATAMOTORS': 'Automobile',
    'M&M': 'Automobile',
    'BAJAJ-AUTO': 'Automobile',
    'EICHERMOT': 'Automobile',
    'GABRIEL': 'Auto Components',

    // Energy & Oil
    'RELIANCE': 'Energy',
    'ONGC': 'Energy',
    'BPCL': 'Energy',
    'IOC': 'Energy',
    'POWERGRID': 'Energy',

    // Consumer Goods & FMCG
    'HINDUNILVR': 'FMCG',
    'ITC': 'FMCG',
    'NESTLEIND': 'FMCG',
    'BRITANNIA': 'FMCG',

    // Infrastructure & Construction
    'LT': 'Infrastructure',
    'ULTRACEMCO': 'Infrastructure',
    'GRASIM': 'Infrastructure',
    'BHEL': 'Infrastructure',

    // Metals & Mining
    'TATASTEEL': 'Metals & Mining',
    'HINDALCO': 'Metals & Mining',
    'JSWSTEEL': 'Metals & Mining',
    'VEDL': 'Metals & Mining',

    // Telecommunications
    'BHARTIARTL': 'Telecommunications',
    'IDEA': 'Telecommunications',

    // Textiles
    'GARWARE': 'Textiles',
    'ETERNAL': 'Textiles',

    // Others
    'CAMS': 'Financial Services',
    'FIRSTSOURCE': 'IT Services',
    'SHARDA': 'Chemicals',
    'KALYAN': 'Consumer Goods',
    'KPIGREEN': 'Renewable Energy'
};

/**
 * Get sector for an Indian stock
 * @param {string} symbol - Stock symbol
 * @param {string} name - Stock name
 * @returns {string} Sector name
 */
export function getIndianSector(symbol, name) {
    // Try exact symbol match
    if (indianSectorMap[symbol]) {
        return indianSectorMap[symbol];
    }

    // Try partial matches in name
    const nameLower = name.toLowerCase();

    if (nameLower.includes('pharma') || nameLower.includes('lifescience')) {
        return 'Pharmaceuticals';
    }
    if (nameLower.includes('hospital') || nameLower.includes('healthcare')) {
        return 'Healthcare';
    }
    if (nameLower.includes('bank') || nameLower.includes('finance')) {
        return 'Financial Services';
    }
    if (nameLower.includes('tech') || nameLower.includes('software') || nameLower.includes('it ')) {
        return 'Information Technology';
    }
    if (nameLower.includes('motor') || nameLower.includes('auto')) {
        return 'Automobile';
    }
    if (nameLower.includes('petroleum') || nameLower.includes('oil') || nameLower.includes('gas')) {
        return 'Energy';
    }
    if (nameLower.includes('cement') || nameLower.includes('construction') || nameLower.includes('infra')) {
        return 'Infrastructure';
    }
    if (nameLower.includes('steel') || nameLower.includes('metal') || nameLower.includes('mining')) {
        return 'Metals & Mining';
    }
    if (nameLower.includes('textile') || nameLower.includes('fabric')) {
        return 'Textiles';
    }
    if (nameLower.includes('jewel')) {
        return 'Consumer Goods';
    }
    if (nameLower.includes('etf') || nameLower.includes('gold')) {
        return 'ETF';
    }

    return 'Others';
}

/**
 * Calculate Nifty 50 beta (placeholder - would need historical data)
 * @param {Array} holdings - Portfolio holdings
 * @returns {number} Beta relative to Nifty 50
 */
export function calculateNiftyBeta(holdings) {
    // Placeholder: In production, this would require historical price data
    // and correlation with Nifty 50 index
    return 1.0;
}

/**
 * Get Indian market-specific risk metrics
 * @param {Array} holdings - Portfolio holdings
 * @returns {Object} Risk metrics
 */
export function getIndianRiskMetrics(holdings) {
    return {
        niftyBeta: calculateNiftyBeta(holdings),
        marketIndex: 'Nifty 50',
        marketHours: '09:15 - 15:30 IST',
        tradingDays: 'Monday - Friday (excluding NSE holidays)'
    };
}

/**
 * Enrich Indian holdings with sector and additional data
 * @param {Array} holdings - Raw holdings from parser
 * @returns {Array} Enriched holdings
 */
export function enrichIndianHoldings(holdings) {
    return holdings.map(holding => ({
        ...holding,
        sector: getIndianSector(holding.symbol, holding.name),
        exchange: holding.exchange || 'NSE',
        currency: 'INR'
    }));
}
