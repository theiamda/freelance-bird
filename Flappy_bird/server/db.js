const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        birdone INTEGER DEFAULT 0,
        birdtwo INTEGER DEFAULT 0,
        back INTEGER DEFAULT 0,
        heartone INTEGER DEFAULT 0,
        hearttwo INTEGER DEFAULT 0
    )`);
});

module.exports = db;