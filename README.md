# Mission Bharat

**Smart Venue Platform for Large-Scale Sporting Events**

Mission Bharat is an integrated solution designed to improve the physical event experience for attendees at large-scale sporting venues across India. The platform addresses critical challenges such as crowd movement, waiting times, and real-time coordination while ensuring a seamless and enjoyable experience.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Mobile App  │  │ Command Ctr  │  │ Digital Signage (Kiosk) │ │
│  │ (PWA)       │  │ (Dashboard)  │  │                         │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                │
│              (Auth, Rate Limiting, Routing)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌───────────────────┐
│  User Service │   │  Venue Service  │   │  Safety Service   │
│  - Auth       │   │  - Navigation   │   │  - Crowd Analytics│
│  - Tickets    │   │  - Concessions  │   │  - Emergency      │
│  - Profile    │   │  - Parking      │   │  - Alerts         │
└───────────────┘   └─────────────────┘   └───────────────────┘
```

## 🚀 Features

### For Attendees (Mobile PWA)
- **Digital Ticketing**: QR-based entry with seat lookup
- **Smart Navigation**: Turn-by-turn guidance to seats, concessions, restrooms
- **Mobile Ordering**: Pre-order food/drinks, skip queues
- **Real-time Wait Times**: Live queue lengths for concessions, entry gates
- **Emergency Alerts**: Push notifications for safety situations
- **Parking Finder**: Pre-bookable spots with navigation

### For Operations (Command Center)
- **Crowd Heatmaps**: Real-time density visualization
- **Queue Monitoring**: Live wait times across venue
- **Incident Management**: Track and dispatch for emergencies
- **Staff Tracking**: Security, medical, operations personnel locations
- **Analytics**: Predictive crowd flow, bottleneck detection
- **Emergency Broadcasting**: Multi-channel alert system

### For Venues (Digital Signage)
- **Dynamic Wayfinding**: Update directions based on crowd conditions
- **Live Wait Times**: Display current queues at concessions
- **Emergency Messaging**: Synchronized alerts across all displays
- **Event Information**: Match stats, schedules, promotions

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Real-time | Socket.IO |
| Maps | Leaflet (open-source) |
| Icons | Lucide React |

## 📦 Installation

```bash
cd missionbharat
npm install
```

## 🏃 Running the Application

### Development Mode

1. **Start the backend server** (port 3001):
```bash
npm run server
```

2. **Start the frontend** (port 3000) in a new terminal:
```bash
npm run dev
```

### Access the Application

- **Landing Page**: http://localhost:3000
- **Attendee App (PWA)**: http://localhost:3000/app.html
- **Command Center Dashboard**: http://localhost:3000/dashboard.html
- **Digital Signage**: http://localhost:3000/signage.html
- **API**: http://localhost:3001/api

## 📱 Usage Guide

### Attendee App
1. Open the app on your mobile device
2. View event information and current wait times
3. Access your digital ticket with QR code
4. Order food from concessions
5. Navigate the venue with interactive maps
6. Receive emergency alerts

### Command Center
1. Monitor real-time crowd density heatmaps
2. Track incidents and dispatch staff
3. Update concession wait times
4. Broadcast emergency alerts
5. View staff locations and deployment

### Digital Signage
1. Display on screens throughout the venue
2. Auto-rotate between maps, concessions, and wait times
3. Show emergency alerts when triggered
4. Provide wayfinding information

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/venue` | GET | Get venue information |
| `/api/event` | GET | Get current event details |
| `/api/ticket/:qrCode` | GET | Get ticket by QR code |
| `/api/concessions` | GET | Get all concessions |
| `/api/concessions/:id/wait` | POST | Update concession wait time |
| `/api/orders` | POST | Create new order |
| `/api/parking` | GET | Get parking availability |
| `/api/crowd` | GET | Get crowd zone data |
| `/api/incidents` | GET/POST | Manage incidents |
| `/api/alerts` | GET/POST | Manage emergency alerts |
| `/api/staff` | GET | Get staff locations |
| `/api/simulate` | POST | Trigger data simulation |

## 🎯 Success Metrics

- **40% reduction** in average concession wait times
- **90% of attendees** find seats within 3 minutes
- **60-second** emergency alert delivery to 95% of attendees
- **25% improvement** in post-event satisfaction scores
- **₹2.5-4 Cr** annual incremental revenue per venue

## 🇮🇳 India-Specific Considerations

- **Compliance**: DPDP Act 2023 compliant with anonymized data
- **Cost Estimate**: ₹11-19 crore initial (single venue)
- **Operational Cost**: ₹12-23 lakh/month
- **Inspired by**: M. Chinnaswamy Stadium's AI camera deployment (2026)

## 📁 Project Structure

```
missionbharat/
├── public/
│   ├── manifest.json
│   └── ...
├── src/
│   ├── client/
│   │   ├── app/           # Attendee PWA
│   │   ├── dashboard/     # Command Center
│   │   └── signage/       # Digital Signage
│   ├── styles/
│   │   └── globals.css
│   ├── Landing.jsx        # Landing page
│   └── main.jsx
├── server/
│   ├── db.js              # Database setup
│   ├── seed.js            # Demo data
│   └── index.js           # Express server
├── data/
│   └── venue.db           # SQLite database
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔐 Security Notes

- Location tracking is opt-in only
- All personal data is anonymized for analytics
- Emergency alerts use multiple channels for redundancy
- QR codes are unique and single-use validated

## 📄 License

Built for demonstration purposes as a solution for Indian sporting venues.
