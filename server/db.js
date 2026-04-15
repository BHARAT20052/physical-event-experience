import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { mkdirSync, existsSync } from 'fs';
const dataDir = join(__dirname, '..', 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new Database(join(dataDir, 'venue.db'));

db.pragma('journal_mode = WAL');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Venues table
  CREATE TABLE IF NOT EXISTS venues (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    capacity INTEGER,
    config TEXT
  );

  -- Events table
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    name TEXT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    status TEXT DEFAULT 'scheduled',
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  -- Users/Attendees table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tickets table
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    section TEXT,
    row TEXT,
    seat TEXT,
    qr_code TEXT UNIQUE,
    status TEXT DEFAULT 'valid',
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Concessions table
  CREATE TABLE IF NOT EXISTS concessions (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    location_x REAL,
    location_y REAL,
    current_wait_time INTEGER DEFAULT 0,
    queue_length INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open',
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  -- Orders table
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    concession_id TEXT NOT NULL,
    items TEXT,
    total_amount REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (concession_id) REFERENCES concessions(id)
  );

  -- Parking spots table
  CREATE TABLE IF NOT EXISTS parking_spots (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    section TEXT,
    spot_number TEXT,
    status TEXT DEFAULT 'available',
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  -- Crowd density zones
  CREATE TABLE IF NOT EXISTS crowd_zones (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    name TEXT,
    location_x REAL,
    location_y REAL,
    width REAL,
    height REAL,
    current_density REAL DEFAULT 0,
    max_capacity INTEGER,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  -- Incidents table
  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    type TEXT,
    severity TEXT,
    description TEXT,
    location_x REAL,
    location_y REAL,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  -- Emergency alerts
  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info',
    zones TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  -- Staff table
  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    location_x REAL,
    location_y REAL,
    status TEXT DEFAULT 'active',
    venue_id TEXT,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );
`);

export default db;
