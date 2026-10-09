const fs = require('fs');
const path = require('path');
const db = require('./db');

const schemaPath = path.join(
    __dirname,
    '..',
    '..',
    'database.sql'
);

if (!fs.existsSync(schemaPath)) {
    throw new Error(`Database schema not found: ${schemaPath}`);
}

const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema);

const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
`).all();

console.log('WFC database schema initialized.');
console.log(
    'Tables:',
    tables.map(table => table.name).join(', ')
);

module.exports = db;
