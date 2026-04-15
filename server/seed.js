import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

export function seedDatabase() {
  console.log('Seeding database...');

  // Clear existing data
  db.exec('DELETE FROM alerts');
  db.exec('DELETE FROM incidents');
  db.exec('DELETE FROM orders');
  db.exec('DELETE FROM tickets');
  db.exec('DELETE FROM users');
  db.exec('DELETE FROM concessions');
  db.exec('DELETE FROM parking_spots');
  db.exec('DELETE FROM crowd_zones');
  db.exec('DELETE FROM staff');
  db.exec('DELETE FROM events');
  db.exec('DELETE FROM venues');

  // Create venue
  const venueId = uuidv4();
  db.prepare(`
    INSERT INTO venues (id, name, location, capacity, config)
    VALUES (?, ?, ?, ?, ?)
  `).run(venueId, 'Chinnaswamy Stadium', 'Bangalore, Karnataka', 40000, JSON.stringify({
    zones: ['North', 'South', 'East', 'West'],
    entrances: 8,
    exits: 12
  }));

  // Create event
  const eventId = uuidv4();
  const eventStartTime = new Date();
  eventStartTime.setHours(19, 0, 0, 0);
  const eventEndTime = new Date(eventStartTime);
  eventEndTime.setHours(23, 0, 0, 0);

  db.prepare(`
    INSERT INTO events (id, venue_id, name, start_time, end_time, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(eventId, venueId, 'IPL 2026: RCB vs MI', eventStartTime.toISOString(), eventEndTime.toISOString(), 'live');

  // Create users
  const users = [];
  for (let i = 1; i <= 50; i++) {
    const userId = uuidv4();
    users.push(userId);
    db.prepare(`
      INSERT INTO users (id, name, email, phone)
      VALUES (?, ?, ?, ?)
    `).run(userId, `Attendee ${i}`, `attendee${i}@example.com`, `+91 9876543${String(i).padStart(3, '0')}`);
  }

  // Create tickets
  const sections = ['A', 'B', 'C', 'D'];
  users.forEach((userId, index) => {
    const ticketId = uuidv4();
    const section = sections[index % 4];
    const row = String(Math.floor(index / 4) % 20 + 1);
    const seat = String((index % 50) + 1);
    const qrCode = `QR-${ticketId.slice(0, 8).toUpperCase()}`;

    db.prepare(`
      INSERT INTO tickets (id, event_id, user_id, section, row, seat, qr_code, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(ticketId, eventId, userId, section, row, seat, qrCode, 'valid');
  });

  // Create concessions
  const concessions = [
    { name: 'North Gate Snacks', type: 'food', x: 50, y: 80 },
    { name: 'South Plaza Foods', type: 'food', x: 50, y: 20 },
    { name: 'East Court Refreshments', type: 'beverage', x: 80, y: 50 },
    { name: 'West Wing Cafe', type: 'food', x: 20, y: 50 },
    { name: 'Main Concourse Bar', type: 'beverage', x: 45, y: 45 },
    { name: 'Premium Lounge', type: 'food', x: 55, y: 55 },
    { name: 'Family Zone Eats', type: 'food', x: 30, y: 70 },
    { name: 'Quick Bites Express', type: 'food', x: 70, y: 30 }
  ];

  concessions.forEach((c, index) => {
    const concessionId = uuidv4();
    db.prepare(`
      INSERT INTO concessions (id, venue_id, name, type, location_x, location_y, current_wait_time, queue_length, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(concessionId, venueId, c.name, c.type, c.x, c.y, Math.floor(Math.random() * 15) + 5, Math.floor(Math.random() * 20) + 10, 'open');
  });

  // Create parking spots
  const parkingSections = ['P1', 'P2', 'P3', 'P4'];
  parkingSections.forEach(section => {
    for (let i = 1; i <= 20; i++) {
      const spotId = uuidv4();
      const status = Math.random() > 0.4 ? 'available' : 'occupied';
      db.prepare(`
        INSERT INTO parking_spots (id, venue_id, section, spot_number, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(spotId, venueId, section, `${section}-${i}`, status);
    }
  });

  // Create crowd zones
  const zones = [
    { name: 'North Entrance', x: 50, y: 90, w: 30, h: 10, maxCapacity: 5000 },
    { name: 'South Entrance', x: 50, y: 10, w: 30, h: 10, maxCapacity: 5000 },
    { name: 'East Plaza', x: 85, y: 50, w: 15, h: 30, maxCapacity: 3000 },
    { name: 'West Plaza', x: 15, y: 50, w: 15, h: 30, maxCapacity: 3000 },
    { name: 'Central Concourse', x: 50, y: 50, w: 40, h: 20, maxCapacity: 8000 },
    { name: 'Food Court', x: 30, y: 35, w: 20, h: 15, maxCapacity: 2000 },
    { name: 'Merchandise Zone', x: 70, y: 65, w: 15, h: 15, maxCapacity: 1500 },
    { name: 'VIP Lounge', x: 50, y: 50, w: 10, h: 10, maxCapacity: 500 }
  ];

  zones.forEach(z => {
    const zoneId = uuidv4();
    const density = Math.random() * 0.8;
    db.prepare(`
      INSERT INTO crowd_zones (id, venue_id, name, location_x, location_y, width, height, current_density, max_capacity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(zoneId, venueId, z.name, z.x, z.y, z.w, z.h, density, z.maxCapacity);
  });

  // Create staff
  const staffRoles = [
    { role: 'security', count: 20 },
    { role: 'medical', count: 8 },
    { role: 'operations', count: 15 },
    { role: 'concessions', count: 25 },
    { role: 'usher', count: 30 }
  ];

  staffRoles.forEach(({ role, count }) => {
    for (let i = 0; i < count; i++) {
      const staffId = uuidv4();
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 80 + 10;
      db.prepare(`
        INSERT INTO staff (id, name, role, location_x, location_y, status, venue_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(staffId, `${role.charAt(0).toUpperCase() + role.slice(1)} ${i + 1}`, role, x, y, 'active', venueId);
    }
  });

  // Create sample incident
  const incidentId = uuidv4();
  db.prepare(`
    INSERT INTO incidents (id, venue_id, type, severity, description, location_x, location_y, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(incidentId, venueId, 'medical', 'medium', 'Minor injury at Section B - spectator slipped', 45, 35, 'resolved');

  console.log('Database seeded successfully!');
  console.log(`- Venue: Chinnaswamy Stadium`);
  console.log(`- Event: IPL 2026: RCB vs MI`);
  console.log(`- Tickets: ${users.length}`);
  console.log(`- Concessions: ${concessions.length}`);
  console.log(`- Parking spots: ${parkingSections.length * 20}`);
  console.log(`- Crowd zones: ${zones.length}`);
  console.log(`- Staff members: ${staffRoles.reduce((a, b) => a + b.count, 0)}`);
}
