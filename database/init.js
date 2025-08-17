const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'klantroef.db');
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // MediaAsset table
      db.run(`
        CREATE TABLE IF NOT EXISTS MediaAsset (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('video', 'audio')),
          file_url TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating MediaAsset table:', err);
          reject(err);
          return;
        }
        console.log('MediaAsset table created/verified');
      });

      // AdminUser table
      db.run(`
        CREATE TABLE IF NOT EXISTS AdminUser (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          hashed_password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating AdminUser table:', err);
          reject(err);
          return;
        }
        console.log('AdminUser table created/verified');
      });

      // MediaViewLog table
      db.run(`
        CREATE TABLE IF NOT EXISTS MediaViewLog (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          media_id INTEGER NOT NULL,
          viewed_by_ip TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (media_id) REFERENCES MediaAsset (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating MediaViewLog table:', err);
          reject(err);
          return;
        }
        console.log('MediaViewLog table created/verified');
      });

      // Create indexes for better performance
      db.run('CREATE INDEX IF NOT EXISTS idx_media_asset_type ON MediaAsset(type)', (err) => {
        if (err) console.error('Error creating index on MediaAsset.type:', err);
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_media_view_log_media_id ON MediaViewLog(media_id)', (err) => {
        if (err) console.error('Error creating index on MediaViewLog.media_id:', err);
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_media_view_log_timestamp ON MediaViewLog(timestamp)', (err) => {
        if (err) console.error('Error creating index on MediaViewLog.timestamp:', err);
      });

      db.run('SELECT 1', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialization completed successfully');
          resolve();
        }
      });
    });
  });
}

function getDatabase() {
  return db;
}

module.exports = {
  initializeDatabase,
  getDatabase
};
