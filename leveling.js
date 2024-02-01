const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./leveling.db');

db.run('CREATE TABLE IF NOT EXISTS users (userId TEXT, guildId TEXT, level INTEGER)');

function addXP(userId, guildId) {
    // Get the user's current level from the database
    db.get('SELECT * FROM users WHERE userId = ? AND guildId = ?', [userId, guildId], (err, row) => {
        let level = row ? row.level + 1 : 1;

        // Update the user's level in the database
        db.run('REPLACE INTO users (userId, guildId, level) VALUES (?, ?, ?)', [userId, guildId, level]);
    });
}

function getLevel(userId, guildId, callback) {
    // Get the user's current level from the database
    db.get('SELECT * FROM users WHERE userId = ? AND guildId = ?', [userId, guildId], (err, row) => {
        if (err) {
            console.error(err);
            callback(err);
        } else if (row) {
            callback(null, row.level);
        } else {
            callback();
        }
    });
}

module.exports = { addXP, getLevel };