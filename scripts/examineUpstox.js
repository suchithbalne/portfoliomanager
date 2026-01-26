const XLSX = require('xlsx');
const path = require('path');

// Read the Upstox Excel file
const filePath = path.join(__dirname, '../resources/Holdings_25-Jan-2026_Veeraprathap.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('=== Sheet Names ===');
console.log(workbook.SheetNames);

const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

console.log('\n=== First 30 rows ===\n');
for (let i = 0; i < Math.min(30, data.length); i++) {
    if (data[i] && data[i].length > 0) {
        console.log(`Row ${i}:`, data[i]);
    }
}

console.log('\n=== Looking for Holdings Table ===\n');

// Find the row with column headers
let headerRowIndex = -1;
for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row && row.length > 3 && (
        row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('symbol')) ||
        row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('quantity')) ||
        row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('isin'))
    )) {
        headerRowIndex = i;
        console.log(`Found potential header at row ${i}:`, row);
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
