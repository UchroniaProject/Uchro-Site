const sqlite3 = require('sqlite3').verbose();
const { USERS_DB_PATH } = process.env;
const db = new sqlite3.Database(USERS_DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
});

module.exports = db;
