'use strict';

const fs = require('fs');
const path = require('path');
const db = require('./db');

db.pragma('busy_timeout = 10000');

const migrationsDir = path.join(__dirname, '..', '..', 'migrations');

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const files = fs.readdirSync(migrationsDir)
  .filter(name => /^\d+_[a-z0-9_-]+\.sql$/i.test(name))
  .sort();

try {
  for (const name of files) {
    const alreadyApplied = db.prepare(
      'SELECT 1 FROM schema_migrations WHERE name = ?'
    ).get(name);

    if (alreadyApplied) {
      console.log('Already applied:', name);
      continue;
    }

    const sql = fs.readFileSync(
      path.join(migrationsDir, name), 'utf8'
    );

    db.transaction(() => {
      db.exec(sql);
      db.prepare(
        'INSERT INTO schema_migrations (name) VALUES (?)'
      ).run(name);
    })();

    console.log('Applied:', name);
  }

  const integrity = db.pragma('integrity_check');
  if (integrity.length !== 1 || integrity[0].integrity_check !== 'ok') {
    throw new Error('SQLite integrity check failed');
  }

  const foreignKeyErrors = db.pragma('foreign_key_check');
  if (foreignKeyErrors.length) {
    console.error('Foreign-key violations:', foreignKeyErrors);
    process.exitCode = 1;
  } else {
    console.log('Foreign-key check: OK');
    console.log('SQLite integrity check: OK');
  }
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
