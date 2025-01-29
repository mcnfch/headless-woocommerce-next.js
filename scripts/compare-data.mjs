import fs from 'fs/promises';

async function main() {
    const data1 = JSON.parse(await fs.readFile('data1.json', 'utf8')); // API
    const data2 = JSON.parse(await fs.readFile('data2.json', 'utf8')); // MySQL

    console.log('Product counts:');
    console.log('API (data1.json):', data1.length);
    console.log('MySQL (data2.json):', data2.length);

    // Compare first product fields
    const sample1 = data1[0];
    const sample2 = data2[0];

    console.log('\nFields in API but not in MySQL:');
    const apiFields = new Set(Object.keys(sample1));
    const mysqlFields = new Set(Object.keys(sample2));
    
    for (const field of apiFields) {
        if (!mysqlFields.has(field)) {
            console.log(`- ${field}`);
        }
    }

    console.log('\nFields in MySQL but not in API:');
    for (const field of mysqlFields) {
        if (!apiFields.has(field)) {
            console.log(`- ${field}`);
        }
    }

    // Compare structure of common fields
    console.log('\nStructure differences in common fields:');
    const commonFields = [...apiFields].filter(f => mysqlFields.has(f));
    
    for (const field of commonFields) {
        const apiValue = sample1[field];
        const mysqlValue = sample2[field];
        
        if (typeof apiValue !== typeof mysqlValue) {
            console.log(`\n${field}:`);
            console.log('  API type:', typeof apiValue);
            console.log('  MySQL type:', typeof mysqlValue);
            console.log('  API sample:', JSON.stringify(apiValue).slice(0, 100));
            console.log('  MySQL sample:', JSON.stringify(mysqlValue).slice(0, 100));
        }
    }
}

main().catch(console.error);
