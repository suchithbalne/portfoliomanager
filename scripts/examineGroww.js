const XLSX = require('xlsx');
const path = require('path');

// Read the Groww Excel file
const filePath = path.join(__dirname, '../resources/Stocks_Holdings_Statement_1744147853_2025-07-01_1768835044813.xlsx');
const workbook = XLSX.readFile(filePath);

const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

console.log('=== Looking for Holdings Table ===\n');

// Find the row with column headers (likely contains "Stock Name", "Quantity", etc.)
let headerRowIndex = -1;
for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row && row.length > 5 && (
        row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('stock')) ||
        row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('quantity'))
    )) {
        headerRowIndex = i;
        console.log(`Found potential header at row ${i}:`, row);
        break;
    }
}

if (headerRowIndex !== -1) {
    console.log('\n=== Holdings Data (first 10 rows) ===\n');
    const headers = data[headerRowIndex];
    console.log('Headers:', headers);

    for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 11, data.length); i++) {
        if (data[i] && data[i].length > 0) {
            console.log(`\nRow ${i - headerRowIndex}:`);
            headers.forEach((header, idx) => {
                if (data[i][idx] !== undefined && data[i][idx] !== '') {
                    console.log(`  ${header}: ${data[i][idx]}`);
                }
            });
        }
    }
}

console.log('\n=== All rows from 10-30 (to find table) ===\n');
for (let i = 10; i < Math.min(30, data.length); i++) {
    console.log(`Row ${i}:`, data[i]);
}
