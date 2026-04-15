import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './db.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, '..');
const publicDir = process.env.NODE_ENV === 'production' ? join(baseDir, 'dist') : baseDir;

// Initialize database
const dataDir = join(baseDir, 'data');
import { mkdirSync, existsSync } from 'fs';
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}
seedDatabase();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

// API Routes

// Get venue info
app.get('/api/venue', (req, res) => {
  const venue = db.prepare('SELECT * FROM venues LIMIT 1').get();
  if (venue) {
    venue.config = JSON.parse(venue.config);
  }
  res.json(venue || {});
});

// Get current event
app.get('/api/event', (req, res) => {
  const event = db.prepare(`
    SELECT e.*, v.name as venue_name
    FROM events e
    JOIN venues v ON e.venue_id = v.id
    WHERE e.status = 'live'
    LIMIT 1
  `).get();
  res.json(event || {});
});

// Get ticket by QR code
app.get('/api/ticket/:qrCode', (req, res) => {
  const { qrCode } = req.params;
  const ticket = db.prepare(`
    SELECT t.*, e.name as event_name, e.start_time, v.name as venue_name
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    JOIN venues v ON e.venue_id = v.id
    WHERE t.qr_code = ?
  `).get(qrCode);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  res.json(ticket);
});

// Get all concessions
app.get('/api/concessions', (req, res) => {
  const concessions = db.prepare('SELECT * FROM concessions').all();
  res.json(concessions);
});

// Update concession wait time (for dashboard)
app.post('/api/concessions/:id/wait', (req, res) => {
  const { id } = req.params;
  const { waitTime, queueLength } = req.body;

  db.prepare(`
    UPDATE concessions
    SET current_wait_time = ?, queue_length = ?
    WHERE id = ?
  `).run(waitTime, queueLength, id);

  // Broadcast update via WebSocket
  const concession = db.prepare('SELECT * FROM concessions WHERE id = ?').get(id);
  io.emit('concession_update', concession);

  res.json(concession);
});

// Create order
app.post('/api/orders', (req, res) => {
  const { userId, concessionId, items, totalAmount } = req.body;
  const orderId = `ORD-${Date.now()}`;

  db.prepare(`
    INSERT INTO orders (id, user_id, concession_id, items, total_amount, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(orderId, userId, concessionId, JSON.stringify(items), totalAmount);

  // Update queue length
  db.prepare(`
    UPDATE concessions SET queue_length = queue_length + 1 WHERE id = ?
  `).run(concessionId);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  io.emit('order_created', order);

  res.json(order);
});

// Get user orders
app.get('/api/users/:userId/orders', (req, res) => {
  const { userId } = req.params;
  const orders = db.prepare(`
    SELECT o.*, c.name as concession_name
    FROM orders o
    JOIN concessions c ON o.concession_id = c.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(userId);
  res.json(orders);
});

// Get parking availability
app.get('/api/parking', (req, res) => {
  const stats = db.prepare(`
    SELECT section,
           COUNT(*) as total,
           SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available
    FROM parking_spots
    GROUP BY section
  `).all();
  res.json(stats);
});

// Reserve parking
app.post('/api/parking/:spotId/reserve', (req, res) => {
  const { spotId } = req.params;
  db.prepare(`UPDATE parking_spots SET status = 'occupied' WHERE id = ?`).run(spotId);
  const spot = db.prepare('SELECT * FROM parking_spots WHERE id = ?').get(spotId);
  io.emit('parking_update', spot);
  res.json(spot);
});

// Get crowd zones
app.get('/api/crowd', (req, res) => {
  const zones = db.prepare('SELECT * FROM crowd_zones').all();
  res.json(zones);
});

// Update crowd density (for simulation)
app.post('/api/crowd/:zoneId/density', (req, res) => {
  const { zoneId } = req.params;
  const { density } = req.body;

  db.prepare('UPDATE crowd_zones SET current_density = ? WHERE id = ?').run(density, zoneId);

  const zone = db.prepare('SELECT * FROM crowd_zones WHERE id = ?').get(zoneId);
  io.emit('crowd_update', zone);

  res.json(zone);
});

// Get incidents
app.get('/api/incidents', (req, res) => {
  const incidents = db.prepare(`
    SELECT * FROM incidents
    WHERE status = 'open'
    ORDER BY created_at DESC
  `).all();
  res.json(incidents);
});

// Create incident
app.post('/api/incidents', (req, res) => {
  const { venueId, type, severity, description, locationX, locationY } = req.body;
  const incidentId = `INC-${Date.now()}`;

  db.prepare(`
    INSERT INTO incidents (id, venue_id, type, severity, description, location_x, location_y, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
  `).run(incidentId, venueId, type, severity, description, locationX, locationY);

  const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(incidentId);
  io.emit('incident_created', incident);

  res.json(incident);
});

// Resolve incident
app.put('/api/incidents/:id', (req, res) => {
  const { id } = req.params;
  db.prepare(`UPDATE incidents SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = ?`).run(id);
  io.emit('incident_resolved', { id });
  res.json({ success: true });
});

// Get active alerts
app.get('/api/alerts', (req, res) => {
  const alerts = db.prepare(`
    SELECT * FROM alerts
    ORDER BY created_at DESC
    LIMIT 10
  `).all();
  res.json(alerts);
});

// Create emergency alert
app.post('/api/alerts', (req, res) => {
  const { venueId, title, message, severity, zones } = req.body;
  const alertId = `ALT-${Date.now()}`;

  db.prepare(`
    INSERT INTO alerts (id, venue_id, title, message, severity, zones)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(alertId, venueId, title, message, severity, JSON.stringify(zones || []));

  const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId);
  io.emit('alert_created', alert);

  res.json(alert);
});

// Get staff locations
app.get('/api/staff', (req, res) => {
  const staff = db.prepare("SELECT id, name, role, location_x, location_y, status FROM staff WHERE status = 'active'").all();
  res.json(staff);
});

// Update staff location
app.post('/api/staff/:id/location', (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;

  db.prepare('UPDATE staff SET location_x = ?, location_y = ? WHERE id = ?').run(x, y, id);
  const staff = db.prepare('SELECT id, name, role, location_x, location_y FROM staff WHERE id = ?').get(id);
  io.emit('staff_update', staff);

  res.json(staff);
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe_venue', (venueId) => {
    socket.join(`venue:${venueId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Simulation endpoint to update random data
app.post('/api/simulate', (req, res) => {
  // Randomly update crowd densities
  const zones = db.prepare('SELECT * FROM crowd_zones').all();
  zones.forEach(zone => {
    const newDensity = Math.max(0, Math.min(1, zone.current_density + (Math.random() - 0.5) * 0.2));
    db.prepare('UPDATE crowd_zones SET current_density = ? WHERE id = ?').run(newDensity, zone.id);
    io.emit('crowd_update', { ...zone, current_density: newDensity });
  });

  // Randomly update concession wait times
  const concessions = db.prepare('SELECT * FROM concessions').all();
  concessions.forEach(concession => {
    const newWait = Math.max(0, Math.floor(concession.current_wait_time + (Math.random() - 0.5) * 10));
    const newQueue = Math.max(0, Math.floor(concession.queue_length + (Math.random() - 0.5) * 5));
    db.prepare('UPDATE concessions SET current_wait_time = ?, queue_length = ? WHERE id = ?').run(newWait, newQueue, concession.id);
    io.emit('concession_update', { ...concession, current_wait_time: newWait, queue_length: newQueue });
  });

  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Mission Bharat server running on port ${PORT}`);
  console.log(`- API: http://localhost:${PORT}/api`);
  console.log(`- App: http://localhost:${PORT}/app.html`);
  console.log(`- Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`- Signage: http://localhost:${PORT}/signage.html`);
});
