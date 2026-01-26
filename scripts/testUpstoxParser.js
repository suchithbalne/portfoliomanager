const XLSX = require('xlsx');
const path = require('path');

// Simulate the Upstox parser logic
function parseNumeric(value) {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;

    let cleaned = String(value).trim();
    
    if (cleaned.includes('%')) {
        cleaned = cleaned.replace(/[+\-%\s]/g, '');
    } else {
        cleaned = cleaned.replace(/[+,\s]/g, '');
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}

function parseUpstoxRow(row, headers) {
    const colMap = {};
    headers.forEach((header, idx) => {
        if (header) {
            const cleanHeader = header.toLowerCase().trim().replace(/\s*\(\d+\)\s*$/, '');
            colMap[cleanHeader] = idx;
        }
    });

    const symbol = row[colMap['symbol']] || '';
    const category = row[colMap['category']] || '';
    const quantity = parseNumeric(row[colMap['net qty']]) || 0;
    const avgPrice = parseNumeric(row[colMap['avg. price']]) || 0;
    const ltp = parseNumeric(row[colMap['ltp']]) || 0;
    const currentValue = parseNumeric(row[colMap['current value']]) || 0;
    const overallPL = parseNumeric(row[colMap['overall p&l']]) || 0;
    const overallPercent = parseNumeric(row[colMap['overall %']]) || 0;

    if (!symbol || quantity === 0) {
        return null;
    }

    const totalCost = quantity * avgPrice;
    const exchange = category.includes('NSE') ? 'NSE' : 
                    category.includes('BSE') ? 'BSE' : 'NSE';

    return {
        symbol: symbol.trim(),
        name: symbol.trim(),
        quantity: quantity,
        costBasis: avgPrice,
        currentPrice: ltp,
        marketValue: currentValue,
        totalCost: totalCost,
        gainLoss: overallPL,
        gainLossPercent: overallPercent,
        market: 'INDIA',
        exchange: exchange,
        category: category,
        assetType: 'Stock',
        sector: 'Unknown',
        lastUpdated: new Date().toISOString()
    };
}

// Read and parse the Upstox file
const filePath = path.join(__dirname, '../resources/Holdings_25-Jan-2026_Veeraprathap.xlsx');
const workbook = XLSX.readFile(filePath);

// Get the "All" sheet
let sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('all'));
if (!sheetName) {
    sheetName = workbook.SheetNames[0];
}

console.log(`Using sheet: ${sheetName}\n`);

const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Find header row
let headerRowIndex = -1;
for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row && row.length > 5 &&
        row.some(cell => typeof cell === 'string' && 
                cell.toLowerCase().includes('symbol'))) {
        headerRowIndex = i;
        break;
    }
}

if (headerRowIndex === -1) {
    console.error('Could not find holdings table');
    process.exit(1);
}

const headers = rows[headerRowIndex];
console.log('Headers:', headers);
console.log('\n=== Parsing Holdings ===\n');

const holdings = [];
for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];

    if (!row || row.length === 0 || !row[0]) {
        break;
    }

    if (typeof row[0] !== 'string') {
        break;
    }

    const holding = parseUpstoxRow(row, headers);
    if (holding) {
        holdings.push(holding);
    }
}

console.log(`Total holdings parsed: ${holdings.length}\n`);

// Display first 5 holdings
console.log('=== First 5 Holdings ===\n');
holdings.slice(0, 5).forEach((holding, idx) => {
    console.log(`${idx + 1}. ${holding.symbol} (${holding.exchange})`);
    console.log(`   Quantity: ${holding.quantity}`);
    console.log(`   Cost Basis: ₹${holding.costBasis.toFixed(2)}`);
    console.log(`   Current Price: ₹${holding.currentPrice.toFixed(2)}`);
    console.log(`   Market Value: ₹${holding.marketValue.toFixed(2)}`);
    console.log(`   Total Cost: ₹${holding.totalCost.toFixed(2)}`);
    console.log(`   Gain/Loss: ₹${holding.gainLoss.toFixed(2)} (${holding.gainLossPercent.toFixed(2)}%)`);
    console.log('');
});

// Calculate portfolio summary
const totalInvested = holdings.reduce((sum, h) => sum + h.totalCost, 0);
const totalCurrent = holdings.reduce((sum, h) => sum + h.marketValue, 0);
const totalGainLoss = totalCurrent - totalInvested;
const totalGainLossPercent = (totalGainLoss / totalInvested) * 100;

console.log('=== Portfolio Summary ===');
console.log(`Total Invested: ₹${totalInvested.toFixed(2)}`);
console.log(`Current Value: ₹${totalCurrent.toFixed(2)}`);
console.log(`Total Gain/Loss: ₹${totalGainLoss.toFixed(2)} (${totalGainLossPercent.toFixed(2)}%)`);
console.log(`Number of Holdings: ${holdings.length}`);

// Exchange breakdown
const nseCount = holdings.filter(h => h.exchange === 'NSE').length;
const bseCount = holdings.filter(h => h.exchange === 'BSE').length;
console.log(`\nExchange Breakdown:`);
console.log(`  NSE: ${nseCount} holdings`);
console.log(`  BSE: ${bseCount} holdings`);
