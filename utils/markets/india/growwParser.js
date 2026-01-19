import * as XLSX from 'xlsx';
import { MARKETS } from '../marketConfig.js';

/**
 * Parse Groww Excel portfolio file
 * @param {File} file - The uploaded Excel file
 * @returns {Promise<Array>} Array of holdings
 */
export async function parseGrowwFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                // Find the header row (contains "Stock Name", "ISIN", etc.)
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
                    throw new Error('Could not find holdings table in Groww file');
                }

                const headers = rows[headerRowIndex];
                const holdings = [];

                // Parse data rows
                for (let i = headerRowIndex + 1; i < rows.length; i++) {
                    const row = rows[i];

                    // Stop if we hit an empty row or summary section
                    if (!row || row.length === 0 || !row[0]) {
                        break;
                    }

                    // Skip if first cell is not a string (likely a summary row)
                    if (typeof row[0] !== 'string') {
                        break;
                    }

                    const holding = parseGrowwRow(row, headers);
                    if (holding) {
                        holdings.push(holding);
                    }
                }

                resolve(holdings);
            } catch (error) {
                reject(new Error(`Failed to parse Groww file: ${error.message}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * Parse a single row from Groww holdings table
 * @param {Array} row - Row data
 * @param {Array} headers - Column headers
 * @returns {Object} Holding object
 */
function parseGrowwRow(row, headers) {
    // Map column names to indices
    const colMap = {};
    headers.forEach((header, idx) => {
        if (header) {
            colMap[header.toLowerCase().trim()] = idx;
        }
    });

    const stockName = row[colMap['stock name']] || '';
    const isin = row[colMap['isin']] || '';
    const quantity = parseFloat(row[colMap['quantity']]) || 0;
    const avgBuyPrice = parseFloat(row[colMap['average buy price']]) || 0;
    const buyValue = parseFloat(row[colMap['buy value']]) || 0;
    const closingPrice = parseFloat(row[colMap['closing price']]) || 0;
    const closingValue = parseFloat(row[colMap['closing value']]) || 0;
    const unrealisedPL = parseFloat(row[colMap['unrealised p&l']]) || 0;

    // Skip if essential data is missing
    if (!stockName || quantity === 0) {
        return null;
    }

    // Extract symbol from stock name (remove "LTD", "LIMITED", etc.)
    const symbol = extractSymbol(stockName);

    return {
        symbol: symbol,
        name: stockName.trim(),
        quantity: quantity,
        costBasis: avgBuyPrice,
        currentPrice: closingPrice,
        marketValue: closingValue,
        totalCost: buyValue,
        gainLoss: unrealisedPL,
        gainLossPercent: buyValue > 0 ? (unrealisedPL / buyValue) * 100 : 0,

        // Indian market specific fields
        market: MARKETS.INDIA,
        exchange: 'NSE', // Default to NSE
        isin: isin,

        // Asset classification
        assetType: isin.startsWith('INF') ? 'ETF' : 'Stock',
        sector: 'Unknown', // Will be enriched later

        // Metadata
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Extract a clean symbol from stock name
 * @param {string} name - Full stock name
 * @returns {string} Cleaned symbol
 */
function extractSymbol(name) {
    // Remove common suffixes
    let symbol = name
        .replace(/\s+(LTD\.?|LIMITED|CORP\.?|INC\.?|PVT\.?)$/i, '')
        .trim()
        .toUpperCase();

    // Handle special cases
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

    // Check if we have a known mapping
    for (const [key, value] of Object.entries(symbolMap)) {
        if (symbol.includes(key)) {
            return value;
        }
    }

    // Otherwise, use first word or abbreviation
    const words = symbol.split(/\s+/);
    if (words.length === 1) {
        return words[0];
    }

    // If multiple words, try to create abbreviation
    if (words.length <= 4) {
        return words.map(w => w[0]).join('');
    }

    // Fallback: use first word
    return words[0];
}

/**
 * Validate Groww file format
 * @param {File} file - The uploaded file
 * @returns {boolean} True if file appears to be from Groww
 */
export function isGrowwFile(file) {
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        return false;
    }

    // Check if filename contains "groww" or "holdings"
    return fileName.includes('groww') ||
        fileName.includes('holdings') ||
        fileName.includes('stock');
}
