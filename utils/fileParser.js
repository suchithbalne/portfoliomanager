import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { parseGrowwFile, isGrowwFile } from './markets/india/growwParser';
import { enrichIndianHoldings } from './markets/india/indiaMetrics';
import { MARKETS } from './markets/marketConfig';

/**
 * Parse CSV file
 */
export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const normalized = normalizeData(results.data);
                    resolve(normalized);
                } catch (error) {
                    reject(error);
                }
            },
            error: (error) => {
                reject(error);
            },
        });
    });
};

/**
 * Parse Excel file (US brokers)
 */
export const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const normalized = normalizeData(jsonData);
                resolve(normalized);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
};

/**
 * Clean numeric value from string (removes $, +, %, commas)
 */
const cleanNumericValue = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;

    // Remove $, +, %, commas, and whitespace
    const cleaned = String(value).replace(/[\$\+\%\,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Normalize data from different broker formats
 */
const normalizeData = (data) => {
    // Filter out empty rows and footer rows (Fidelity includes disclaimers at the bottom)
    const validRows = data.filter(row => {
        // Must have a symbol and it shouldn't be cash or empty
        const symbol = detectField(row, ['Symbol', 'symbol', 'Ticker', 'ticker', 'SYMBOL']);
        return symbol &&
            symbol.trim() !== '' &&
            !symbol.includes('FCASH') &&
            !symbol.includes('**') &&
            !row.Symbol?.includes('The data and information'); // Filter out Fidelity disclaimers
    });

    return validRows.map((row) => {
        // Detect Fidelity format (has "Description" and "Current Value" columns)
        const isFidelityFormat = row.Description !== undefined || row['Current Value'] !== undefined;

        let normalized;

        if (isFidelityFormat) {
            // Fidelity-specific parsing
            normalized = {
                symbol: row.Symbol?.trim() || '',
                name: row.Description?.trim() || row.Symbol?.trim() || '',
                quantity: cleanNumericValue(row.Quantity),
                currentPrice: cleanNumericValue(row['Last Price']),
                marketValue: cleanNumericValue(row['Current Value']),
                costBasis: 0, // Will calculate from average cost basis
                totalCost: cleanNumericValue(row['Cost Basis Total']),
                gainLoss: cleanNumericValue(row['Total Gain/Loss Dollar']),
                gainLossPercent: cleanNumericValue(row['Total Gain/Loss Percent']),
                assetType: determineAssetType(row.Type, row.Symbol),
                sector: determineSector(row.Symbol, row.Description),
                purchaseDate: new Date().toISOString().split('T')[0], // Default to today
                market: MARKETS.US, // US market
                exchange: 'NYSE', // Default exchange
            };

            // Calculate average cost basis if we have total cost and quantity
            if (normalized.quantity > 0 && normalized.totalCost > 0) {
                normalized.costBasis = normalized.totalCost / normalized.quantity;
            } else if (row['Average Cost Basis']) {
                normalized.costBasis = cleanNumericValue(row['Average Cost Basis']);
                normalized.totalCost = normalized.costBasis * normalized.quantity;
            }

            // Recalculate market value if not provided
            if (normalized.marketValue === 0 && normalized.quantity > 0 && normalized.currentPrice > 0) {
                normalized.marketValue = normalized.quantity * normalized.currentPrice;
            }

            // Recalculate gain/loss if not provided
            if (normalized.gainLoss === 0 && normalized.marketValue > 0 && normalized.totalCost > 0) {
                normalized.gainLoss = normalized.marketValue - normalized.totalCost;
                normalized.gainLossPercent = (normalized.gainLoss / normalized.totalCost) * 100;
            }
        } else {
            // Generic format parsing
            normalized = {
                symbol: detectField(row, ['symbol', 'Symbol', 'Ticker', 'ticker', 'SYMBOL']),
                name: detectField(row, ['name', 'Name', 'Description', 'description', 'Security Name', 'DESCRIPTION']),
                quantity: parseFloat(detectField(row, ['quantity', 'Quantity', 'Shares', 'shares', 'Qty', 'qty', 'QUANTITY']) || 0),
                costBasis: parseFloat(detectField(row, ['costBasis', 'Cost Basis', 'cost_basis', 'Average Cost', 'averageCost', 'Average Cost Basis', 'Price Paid', 'COST_BASIS']) || 0),
                currentPrice: parseFloat(detectField(row, ['currentPrice', 'Current Price', 'current_price', 'Last Price', 'lastPrice', 'Price', 'price', 'CURRENT_PRICE']) || 0),
                assetType: detectField(row, ['assetType', 'Asset Type', 'asset_type', 'Type', 'type', 'Security Type', 'ASSET_TYPE']) || 'Stock',
                sector: detectField(row, ['sector', 'Sector', 'Industry', 'industry', 'SECTOR']) || 'Unknown',
                purchaseDate: detectField(row, ['purchaseDate', 'Purchase Date', 'purchase_date', 'Date Acquired', 'dateAcquired', 'PURCHASE_DATE']) || new Date().toISOString().split('T')[0],
                market: MARKETS.US, // Default to US
                exchange: 'NYSE',
            };

            // Calculate derived values
            normalized.marketValue = normalized.quantity * normalized.currentPrice;
            normalized.totalCost = normalized.quantity * normalized.costBasis;
            normalized.gainLoss = normalized.marketValue - normalized.totalCost;
            normalized.gainLossPercent = normalized.totalCost > 0
                ? ((normalized.gainLoss / normalized.totalCost) * 100)
                : 0;
        }

        return normalized;
    }).filter(item => item.symbol && item.quantity > 0); // Filter out invalid entries
};

/**
 * Determine asset type from Fidelity Type field or symbol
 */
const determineAssetType = (type, symbol) => {
    if (!type) {
        // Guess from symbol
        if (symbol?.includes('ETF') || symbol?.match(/^(VOO|VTI|SPY|QQQ|IWM|VEA|VWO|AGG|BND)$/)) {
            return 'ETF';
        }
        return 'Stock';
    }

    const typeUpper = type.toUpperCase();
    if (typeUpper.includes('ETF')) return 'ETF';
    if (typeUpper.includes('MUTUAL')) return 'Mutual Fund';
    if (typeUpper.includes('BOND')) return 'Bond';
    if (typeUpper.includes('OPTION')) return 'Option';
    if (typeUpper.includes('CASH')) return 'Cash';

    return 'Stock';
};

/**
 * Determine sector from symbol and description
 */
const determineSector = (symbol, description) => {
    if (!description) return 'Unknown';

    const descUpper = description.toUpperCase();

    // Technology
    if (descUpper.includes('SEMICONDUCTOR') || descUpper.includes('SOFTWARE') ||
        descUpper.includes('COMPUTING') || descUpper.includes('QUANTUM') ||
        descUpper.includes('TECH') || descUpper.includes('MICRO DEVICES') ||
        descUpper.includes('NVIDIA') || descUpper.includes('INTEL') ||
        descUpper.includes('MICROSOFT') || descUpper.includes('ALPHABET') ||
        descUpper.includes('META') || descUpper.includes('BROADCOM')) {
        return 'Technology';
    }

    // Automotive/Transportation
    if (descUpper.includes('TESLA') || descUpper.includes('AUTOMOTIVE') ||
        descUpper.includes('AVIATION') || descUpper.includes('ROBOTICS')) {
        return 'Automotive';
    }

    // E-commerce/Retail
    if (descUpper.includes('AMAZON') || descUpper.includes('ECOMMERCE')) {
        return 'E-commerce';
    }

    // Financial
    if (descUpper.includes('FINANCIAL') || descUpper.includes('BANK') ||
        descUpper.includes('SOFI') || descUpper.includes('TECHNOLOGIES INC')) {
        return 'Financial';
    }

    // Healthcare/Biotech
    if (descUpper.includes('THERAPEUTICS') || descUpper.includes('CRISPR') ||
        descUpper.includes('HEALTHCARE') || descUpper.includes('PHARMA')) {
        return 'Healthcare';
    }

    // Energy/Utilities
    if (descUpper.includes('ENERGY') || descUpper.includes('NEXTERA')) {
        return 'Energy';
    }

    // Index Fund
    if (descUpper.includes('INDEX') || descUpper.includes('S&P') ||
        descUpper.includes('VANGUARD') || descUpper.includes('ETF')) {
        return 'Index Fund';
    }

    return 'Technology'; // Default for tech-heavy portfolios
};

/**
 * Detect field from multiple possible column names
 */
const detectField = (row, possibleNames) => {
    for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
            return row[name];
        }
    }
    return null;
};

/**
 * Validate portfolio data
 */
export const validatePortfolioData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No valid data found in file');
    }

    const requiredFields = ['symbol', 'quantity'];
    const invalidRows = data.filter(row => {
        return !requiredFields.every(field => row[field]);
    });

    if (invalidRows.length === data.length) {
        throw new Error('No valid holdings found. Please ensure your file has Symbol and Quantity columns.');
    }

    return true;
};

/**
 * Main file parser function with market detection
 */
export const parsePortfolioFile = async (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();

    let data;
    let market = MARKETS.US; // Default

    // Check if it's a Groww file (Indian market)
    if ((fileExtension === 'xlsx' || fileExtension === 'xls') && isGrowwFile(file)) {
        console.log('Detected Groww file - using Indian market parser');
        data = await parseGrowwFile(file);
        data = enrichIndianHoldings(data);
        market = MARKETS.INDIA;
    } else if (fileExtension === 'csv') {
        data = await parseCSV(file);
        market = MARKETS.US;
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // US broker Excel file
        data = await parseExcel(file);
        market = MARKETS.US;
    } else {
        throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
    }

    validatePortfolioData(data);

    return { data, market };
};
