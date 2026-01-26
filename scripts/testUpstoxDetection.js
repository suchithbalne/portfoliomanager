const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Simulate the isUpstoxFile function
async function isUpstoxFile(filePath) {
    return new Promise((resolve) => {
        try {
            const buffer = fs.readFileSync(filePath);
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            
            console.log('Sheet names:', workbook.SheetNames);
            
            // Check for Upstox-specific sheet names
            const hasUpstoxSheets = workbook.SheetNames.some(name => 
                /^All\s*\(\d+\)$/i.test(name) || 
                /^Demat\s*\(\d+\)$/i.test(name) ||
                name === 'T1' ||
                name === 'Pledged'
            );

            console.log('Has Upstox sheets:', hasUpstoxSheets);

            if (hasUpstoxSheets) {
                resolve(true);
                return;
            }

            // Check for Upstox-specific column headers
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, range: 10 });
            
            console.log('First 10 rows:', rows);
            
            const hasUpstoxHeaders = rows.some(row => 
                row && Array.isArray(row) && 
                row.some(cell => typeof cell === 'string' && 
                         /Symbol\s*\(\d+\)/i.test(cell))
            );

            console.log('Has Upstox headers:', hasUpstoxHeaders);
            resolve(hasUpstoxHeaders);
        } catch (error) {
            console.error('Error:', error.message);
            resolve(false);
        }
    });
}

// Test with Upstox file
const upstoxFile = path.join(__dirname, '../resources/Holdings_25-Jan-2026_Veeraprathap.xlsx');

console.log('Testing Upstox file detection...\n');
console.log('File:', upstoxFile);
console.log('');

isUpstoxFile(upstoxFile).then(result => {
    console.log('\n=== RESULT ===');
    console.log('Is Upstox file:', result);
});
