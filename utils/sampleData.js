// Sample portfolio data for testing
const rawSampleData = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 50,
        costBasis: 150.00,
        currentPrice: 185.50,
        assetType: 'Stock',
        sector: 'Technology',
        purchaseDate: '2023-01-15',
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        quantity: 30,
        costBasis: 280.00,
        currentPrice: 375.25,
        assetType: 'Stock',
        sector: 'Technology',
        purchaseDate: '2023-02-20',
    },
    {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        quantity: 25,
        costBasis: 120.00,
        currentPrice: 142.80,
        assetType: 'Stock',
        sector: 'Technology',
        purchaseDate: '2023-03-10',
    },
    {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        quantity: 20,
        costBasis: 220.00,
        currentPrice: 248.50,
        assetType: 'Stock',
        sector: 'Automotive',
        purchaseDate: '2023-04-05',
    },
    {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        quantity: 15,
        costBasis: 450.00,
        currentPrice: 495.75,
        assetType: 'Stock',
        sector: 'Technology',
        purchaseDate: '2023-05-12',
    },
    {
        symbol: 'VOO',
        name: 'Vanguard S&P 500 ETF',
        quantity: 40,
        costBasis: 380.00,
        currentPrice: 425.30,
        assetType: 'ETF',
        sector: 'Index Fund',
        purchaseDate: '2023-01-08',
    },
    {
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        quantity: 35,
        costBasis: 210.00,
        currentPrice: 245.60,
        assetType: 'ETF',
        sector: 'Index Fund',
        purchaseDate: '2023-02-14',
    },
    {
        symbol: 'JPM',
        name: 'JPMorgan Chase & Co.',
        quantity: 25,
        costBasis: 140.00,
        currentPrice: 168.90,
        assetType: 'Stock',
        sector: 'Financial',
        purchaseDate: '2023-03-22',
    },
    {
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        quantity: 30,
        costBasis: 160.00,
        currentPrice: 155.20,
        assetType: 'Stock',
        sector: 'Healthcare',
        purchaseDate: '2023-06-01',
    },
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 0.5,
        costBasis: 42000.00,
        currentPrice: 51200.00,
        assetType: 'Crypto',
        sector: 'Cryptocurrency',
        purchaseDate: '2023-07-10',
    },
    {
        symbol: 'ETH',
        name: 'Ethereum',
        quantity: 3,
        costBasis: 2800.00,
        currentPrice: 3150.00,
        assetType: 'Crypto',
        sector: 'Cryptocurrency',
        purchaseDate: '2023-07-15',
    },
    {
        symbol: 'DIS',
        name: 'The Walt Disney Company',
        quantity: 40,
        costBasis: 95.00,
        currentPrice: 88.50,
        assetType: 'Stock',
        sector: 'Entertainment',
        purchaseDate: '2023-08-20',
    },
];

// Add calculated fields
export const samplePortfolio = rawSampleData.map(holding => {
    const marketValue = holding.quantity * holding.currentPrice;
    const totalCost = holding.quantity * holding.costBasis;
    const gainLoss = marketValue - totalCost;
    const gainLossPercent = totalCost > 0 ? ((gainLoss / totalCost) * 100) : 0;

    return {
        ...holding,
        marketValue,
        totalCost,
        gainLoss,
        gainLossPercent,
    };
});

export default samplePortfolio;
