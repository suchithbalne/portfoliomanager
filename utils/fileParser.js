import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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
 * Parse Excel file
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
 * Normalize data from different broker formats
 */
const normalizeData = (data) => {
    return data.map((row) => {
        // Try to detect and normalize different broker formats
        const normalized = {
            symbol: detectField(row, ['symbol', 'Symbol', 'Ticker', 'ticker', 'SYMBOL']),
            name: detectField(row, ['name', 'Name', 'Description', 'description', 'Security Name', 'DESCRIPTION']),
            quantity: parseFloat(detectField(row, ['quantity', 'Quantity', 'Shares', 'shares', 'Qty', 'qty', 'QUANTITY']) || 0),
            costBasis: parseFloat(detectField(row, ['costBasis', 'Cost Basis', 'cost_basis', 'Average Cost', 'averageCost', 'Price Paid', 'COST_BASIS']) || 0),
            currentPrice: parseFloat(detectField(row, ['currentPrice', 'Current Price', 'current_price', 'Last Price', 'lastPrice', 'Price', 'price', 'CURRENT_PRICE']) || 0),
            assetType: detectField(row, ['assetType', 'Asset Type', 'asset_type', 'Type', 'type', 'Security Type', 'ASSET_TYPE']) || 'Stock',
            sector: detectField(row, ['sector', 'Sector', 'Industry', 'industry', 'SECTOR']) || 'Unknown',
            purchaseDate: detectField(row, ['purchaseDate', 'Purchase Date', 'purchase_date', 'Date Acquired', 'dateAcquired', 'PURCHASE_DATE']) || new Date().toISOString().split('T')[0],
        };

        // Calculate market value and gain/loss
        normalized.marketValue = normalized.quantity * normalized.currentPrice;
        normalized.totalCost = normalized.quantity * normalized.costBasis;
        normalized.gainLoss = normalized.marketValue - normalized.totalCost;
        normalized.gainLossPercent = normalized.totalCost > 0
            ? ((normalized.gainLoss / normalized.totalCost) * 100)
            : 0;

        return normalized;
    }).filter(item => item.symbol && item.quantity > 0); // Filter out invalid entries
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
 * Main file parser function
 */
export const parsePortfolioFile = async (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();

    let data;

    if (fileExtension === 'csv') {
        data = await parseCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        data = await parseExcel(file);
    } else {
        throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
    }

    validatePortfolioData(data);

    return data;
};
