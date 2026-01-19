// Market Configuration System
// Centralized configuration for all supported markets

export const MARKETS = {
    US: 'US',
    INDIA: 'INDIA'
};

export const CURRENCIES = {
    USD: 'USD',
    INR: 'INR'
};

export const marketConfig = {
    [MARKETS.US]: {
        id: 'US',
        name: 'United States',
        currency: CURRENCIES.USD,
        currencySymbol: '$',
        exchanges: ['NYSE', 'NASDAQ', 'AMEX'],
        timezone: 'America/New_York',
        marketHours: {
            open: '09:30',
            close: '16:00'
        },
        dateFormat: 'MM/DD/YYYY',
        numberFormat: {
            thousand: ',',
            decimal: '.',
            precision: 2
        },
        sectors: [
            'Technology',
            'Healthcare',
            'Financial Services',
            'Consumer Cyclical',
            'Industrials',
            'Communication Services',
            'Consumer Defensive',
            'Energy',
            'Utilities',
            'Real Estate',
            'Basic Materials'
        ],
        benchmarkIndex: 'S&P 500',
        supportedBrokers: ['Fidelity', 'Robinhood', 'Vanguard', 'Charles Schwab']
    },

    [MARKETS.INDIA]: {
        id: 'INDIA',
        name: 'India',
        currency: CURRENCIES.INR,
        currencySymbol: '₹',
        exchanges: ['NSE', 'BSE'],
        timezone: 'Asia/Kolkata',
        marketHours: {
            open: '09:15',
            close: '15:30'
        },
        dateFormat: 'DD-MM-YYYY',
        numberFormat: {
            thousand: ',',
            decimal: '.',
            precision: 2,
            // Indian number system uses lakhs and crores
            useLakhsCrores: true
        },
        sectors: [
            'Information Technology',
            'Financial Services',
            'Healthcare',
            'Consumer Goods',
            'Automobile',
            'Pharmaceuticals',
            'Energy',
            'Infrastructure',
            'Metals & Mining',
            'Telecommunications',
            'Real Estate',
            'FMCG'
        ],
        benchmarkIndex: 'Nifty 50',
        supportedBrokers: ['Groww', 'Zerodha', 'Upstox', 'Angel One']
    }
};

// Helper functions
export function getMarketConfig(market) {
    return marketConfig[market] || marketConfig[MARKETS.US];
}

export function getCurrencySymbol(market) {
    return getMarketConfig(market).currencySymbol;
}

export function formatCurrency(amount, market) {
    const config = getMarketConfig(market);
    const symbol = config.currencySymbol;

    if (market === MARKETS.INDIA && config.numberFormat.useLakhsCrores) {
        return formatIndianCurrency(amount, symbol);
    }

    return `${symbol}${amount.toLocaleString('en-US', {
        minimumFractionDigits: config.numberFormat.precision,
        maximumFractionDigits: config.numberFormat.precision
    })}`;
}

function formatIndianCurrency(amount, symbol) {
    // Indian number system: 1,00,000 (1 lakh), 1,00,00,000 (1 crore)
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (absAmount >= 10000000) {
        // Crores
        return `${sign}${symbol}${(absAmount / 10000000).toFixed(2)} Cr`;
    } else if (absAmount >= 100000) {
        // Lakhs
        return `${sign}${symbol}${(absAmount / 100000).toFixed(2)} L`;
    } else {
        return `${sign}${symbol}${absAmount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
}

export function detectMarketFromBroker(broker) {
    const brokerLower = broker.toLowerCase();

    // Indian brokers
    if (['groww', 'zerodha', 'upstox', 'angel'].some(b => brokerLower.includes(b))) {
        return MARKETS.INDIA;
    }

    // US brokers
    if (['fidelity', 'robinhood', 'vanguard', 'schwab'].some(b => brokerLower.includes(b))) {
        return MARKETS.US;
    }

    return MARKETS.US; // Default to US
}

export function getExchangeForSymbol(symbol, market) {
    if (market === MARKETS.INDIA) {
        // Most Indian stocks trade on NSE
        return 'NSE';
    }
    return 'NYSE'; // Default for US
}
