import * as XLSX from 'xlsx';
import { MARKETS } from '../marketConfig.js';

/**
 * Check if file is an Upstox holdings file
 * @param {File} file - The uploaded Excel file
 * @returns {Promise<boolean>} True if file is from Upstox
 */
export async function isUpstoxFile(file) {
    // Quick filename check
    const fileName = file.name.toLowerCase();
    if (fileName.includes('upstox')) {
        return true;
    }

    // If filename has "holdings" but not "upstox", check file structure
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        return false;
    }

    // Read file to check structure
    return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Upstox files have specific sheet names like "All (91)", "T1", "Demat (91)", "Pledged"
                const hasUpstoxSheets = workbook.SheetNames.some(name => 
                    /^All\s*\(\d+\)$/i.test(name) || 
                    /^Demat\s*\(\d+\)$/i.test(name) ||
                    name === 'T1' ||
                    name === 'Pledged'
                );

                if (hasUpstoxSheets) {
                    resolve(true);
                    return;
                }

                // Check for Upstox-specific column headers
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, range: 10 });
                
                const hasUpstoxHeaders = rows.some(row => 
                    row && Array.isArray(row) && 
                    row.some(cell => typeof cell === 'string' && 
                             /Symbol\s*\(\d+\)/i.test(cell))
                );

                resolve(hasUpstoxHeaders);
            } catch (error) {
                resolve(false);
            }
        };

        reader.onerror = () => resolve(false);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Parse Upstox Excel portfolio file
 * @param {File} file - The uploaded Excel file
 * @returns {Promise<Array>} Array of holdings
 */
export async function parseUpstoxFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get the "All" or "Demat" sheet (prefer "All" if available)
                let sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('all'));
                if (!sheetName) {
                    sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('demat'));
                }
                if (!sheetName) {
                    sheetName = workbook.SheetNames[0];
                }

                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                // Find the header row (contains "Symbol", "Net Qty", etc.)
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
                    throw new Error('Could not find holdings table in Upstox file');
                }

                const headers = rows[headerRowIndex];
                const holdings = [];

                // Parse data rows
                for (let i = headerRowIndex + 1; i < rows.length; i++) {
                    const row = rows[i];

                    // Stop if we hit an empty row
                    if (!row || row.length === 0 || !row[0]) {
                        break;
                    }

                    // Skip if first cell is not a string (likely a summary row)
                    if (typeof row[0] !== 'string') {
                        break;
                    }

                    const holding = parseUpstoxRow(row, headers);
                    if (holding) {
                        holdings.push(holding);
                    }
                }

                resolve(holdings);
            } catch (error) {
                reject(new Error(`Failed to parse Upstox file: ${error.message}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * Parse a single row from Upstox holdings table
 * @param {Array} row - Row data
 * @param {Array} headers - Column headers
 * @returns {Object} Holding object
 */
function parseUpstoxRow(row, headers) {
    // Map column names to indices
    const colMap = {};
    headers.forEach((header, idx) => {
        if (header) {
            const cleanHeader = header.toLowerCase().trim().replace(/\s*\(\d+\)\s*$/, '');
            colMap[cleanHeader] = idx;
        }
    });

    // Extract data from row
    const symbol = row[colMap['symbol']] || '';
    const category = row[colMap['category']] || '';
    const quantity = parseNumeric(row[colMap['net qty']]) || 0;
    const avgPrice = parseNumeric(row[colMap['avg. price']]) || 0;
    const ltp = parseNumeric(row[colMap['ltp']]) || 0;
    const currentValue = parseNumeric(row[colMap['current value']]) || 0;
    const overallPL = parseNumeric(row[colMap['overall p&l']]) || 0;
    const overallPercent = parseNumeric(row[colMap['overall %']]) || 0;

    // Skip if essential data is missing
    if (!symbol || quantity === 0) {
        return null;
    }

    // Calculate total cost
    const totalCost = quantity * avgPrice;

    // Determine exchange from category
    const exchange = category.includes('NSE') ? 'NSE' : 
                    category.includes('BSE') ? 'BSE' : 'NSE';

    return {
        symbol: symbol.trim(),
        name: symbol.trim(), // Upstox doesn't provide full company name
        quantity: quantity,
        costBasis: avgPrice,
        currentPrice: ltp,
        marketValue: currentValue,
        totalCost: totalCost,
        gainLoss: overallPL,
        gainLossPercent: overallPercent,

        // Indian market specific fields
        market: MARKETS.INDIA,
        exchange: exchange,
        category: category,

        // Asset classification
        assetType: 'Stock', // Will be enriched later
        sector: 'Unknown', // Will be enriched later

        // Metadata
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Parse numeric value from Upstox format (handles commas and percentages)
 * @param {any} value - Value to parse
 * @returns {number} Parsed number
 */
function parseNumeric(value) {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;

    let cleaned = String(value).trim();
    
    // Handle percentage format like "+36.04%" or "-3.17%"
    if (cleaned.includes('%')) {
        // Preserve the negative sign, remove +, %, and whitespace
        const isNegative = cleaned.startsWith('-');
        cleaned = cleaned.replace(/[+\-%\s]/g, '');
        if (isNegative) {
            cleaned = '-' + cleaned;
        }
    } else {
        // Handle currency format like "+1,17,084.91" or "-5,295.30"
        cleaned = cleaned.replace(/[+,\s]/g, '');
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Extract symbol from stock name (remove suffixes like "LTD", "LIMITED", etc.)
 * @param {string} name - Stock name
 * @returns {string} Clean symbol
 */
function extractSymbol(name) {
    if (!name) return '';
    
    // Remove common suffixes
    return name
        .replace(/\s+(LTD|LIMITED|INDIA|PVT|PRIVATE|INC|CORP|CORPORATION)\.?$/i, '')
        .trim()
        .toUpperCase();
}
