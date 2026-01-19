const XLSX = require('xlsx');
const path = require('path');

// Simplified version of the parser for Node.js testing
function parseGrowwFileNode(filePath) {
    const workbook = XLSX.readFile(filePath);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    // Find header row
    let headerRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length > 5 &&
            row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('stock name'))) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        throw new Error('Could not find holdings table');
    }

    const headers = rows[headerRowIndex];
    const holdings = [];

    // Map column names
    const colMap = {};
    headers.forEach((header, idx) => {
        if (header) {
            colMap[header.toLowerCase().trim()] = idx;
        }
    });

    // Parse data rows
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];

        if (!row || row.length === 0 || !row[0] || typeof row[0] !== 'string') {
            break;
        }

        const stockName = row[colMap['stock name']] || '';
        const isin = row[colMap['isin']] || '';
        const quantity = parseFloat(row[colMap['quantity']]) || 0;
        const avgBuyPrice = parseFloat(row[colMap['average buy price']]) || 0;
        const buyValue = parseFloat(row[colMap['buy value']]) || 0;
        const closingPrice = parseFloat(row[colMap['closing price']]) || 0;
        const closingValue = parseFloat(row[colMap['closing value']]) || 0;
        const unrealisedPL = parseFloat(row[colMap['unrealised p&l']]) || 0;

        if (!stockName || quantity === 0) {
            continue;
        }

        holdings.push({
            symbol: extractSymbol(stockName),
            name: stockName.trim(),
            quantity,
            costBasis: avgBuyPrice,
            currentPrice: closingPrice,
            marketValue: closingValue,
            totalCost: buyValue,
            gainLoss: unrealisedPL,
            gainLossPercent: buyValue > 0 ? (unrealisedPL / buyValue) * 100 : 0,
            market: 'INDIA',
            exchange: 'NSE',
            isin,
            assetType: isin.startsWith('INF') ? 'ETF' : 'Stock'
        });
    }

    return holdings;
}

function extractSymbol(name) {
    let symbol = name
        .replace(/\s+(LTD\.?|LIMITED|CORP\.?|INC\.?|PVT\.?)$/i, '')
        .trim()
        .toUpperCase();

    const symbolMap = {
        'BHARAT PETROLEUM CORP': 'BPCL',
        'BHEL': 'BHEL',
        'CENTRAL DEPO SER (I)': 'CDSL',
        'COMPUTER AGE MNGT SER': 'CAMS',
        'EICHER MOTORS': 'EICHERMOT',
        'TATA CONSULTANCY SERV': 'TCS',
        'SUN PHARMACEUTICAL IND': 'SUNPHARMA',
        'NIP IND ETF GOLD BEES': 'GOLDBEES'
    };

    for (const [key, value] of Object.entries(symbolMap)) {
        if (symbol.includes(key)) {
            return value;
        }
    }

    const words = symbol.split(/\s+/);
    if (words.length === 1) return words[0];
    if (words.length <= 4) return words.map(w => w[0]).join('');
    return words[0];
}

// Test
try {
    const filePath = path.join(__dirname, '../resources/Stocks_Holdings_Statement_1744147853_2025-07-01_1768835044813.xlsx');
    console.log('Testing Groww Parser...\n');

    const holdings = parseGrowwFileNode(filePath);
    console.log(`✅ Parsed ${holdings.length} holdings\n`);

    console.log('Sample holdings (first 5):');
    holdings.slice(0, 5).forEach((holding, idx) => {
        console.log(`\n${idx + 1}. ${holding.name}`);
        console.log(`   Symbol: ${holding.symbol}`);
        console.log(`   ISIN: ${holding.isin}`);
        console.log(`   Quantity: ${holding.quantity}`);
        console.log(`   Cost Basis: ₹${holding.costBasis.toFixed(2)}`);
        console.log(`   Current Price: ₹${holding.currentPrice.toFixed(2)}`);
        console.log(`   Market Value: ₹${holding.marketValue.toFixed(2)}`);
        console.log(`   Gain/Loss: ₹${holding.gainLoss.toFixed(2)} (${holding.gainLossPercent.toFixed(2)}%)`);
    });

    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalGain = totalValue - totalCost;

    console.log('\n\n📊 Portfolio Summary:');
    console.log(`Total Invested: ₹${totalCost.toFixed(2)}`);
    console.log(`Current Value: ₹${totalValue.toFixed(2)}`);
    console.log(`Total Gain/Loss: ₹${totalGain.toFixed(2)} (${((totalGain / totalCost) * 100).toFixed(2)}%)`);

    console.log('\n✅ Test completed successfully!');
} catch (error) {
    console.error('❌ Test failed:', error.message);
}
