import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MapPin, Ticket, Utensils, Car, AlertTriangle, Home, User, Menu } from 'lucide-react';

const socket = io();

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [venue, setVenue] = useState(null);
  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [concessions, setConcessions] = useState([]);
  const [parking, setParking] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadData();

    socket.on('alert_created', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 5));
      if (alert.severity === 'critical' || alert.severity === 'warning') {
        alertUser(alert);
      }
    });

    socket.on('concession_update', (concession) => {
      setConcessions(prev => prev.map(c => c.id === concession.id ? concession : c));
    });

    return () => socket.off();
  }, []);

  const loadData = async () => {
    try {
      const [venueRes, eventRes, concessionsRes, parkingRes, alertsRes] = await Promise.all([
        fetch('/api/venue').then(r => r.json()),
        fetch('/api/event').then(r => r.json()),
        fetch('/api/concessions').then(r => r.json()),
        fetch('/api/parking').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json())
      ]);
      setVenue(venueRes);
      setEvent(eventRes);
      setConcessions(concessionsRes);
      setParking(parkingRes);
      setAlerts(alertsRes);

      // Load demo ticket
      const ticketRes = await fetch('/api/ticket/QR-12345678');
      if (ticketRes.ok) {
        setTicket(await ticketRes.json());
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const alertUser = (alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, { body: alert.message });
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage event={event} alerts={alerts} onNavigate={setCurrentPage} />;
      case 'ticket':
        return <TicketPage ticket={ticket} venue={venue} />;
      case 'concessions':
        return <ConcessionsPage concessions={concessions} />;
      case 'parking':
        return <ParkingPage parking={parking} />;
      case 'navigate':
        return <NavigationPage venue={venue} concessions={concessions} />;
      default:
        return <HomePage event={event} alerts={alerts} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-bharat-saffron text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold">Vortex</h1>
          <div className="w-10" />
        </div>

        {showMenu && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-lg rounded-b-lg p-4 z-50">
            <nav className="space-y-2">
              <button onClick={() => { setCurrentPage('home'); setShowMenu(false); }} className="block w-full text-left p-2 hover:bg-gray-100 rounded">Home</button>
              <button onClick={() => { setCurrentPage('ticket'); setShowMenu(false); }} className="block w-full text-left p-2 hover:bg-gray-100 rounded">My Ticket</button>
              <button onClick={() => { setCurrentPage('concessions'); setShowMenu(false); }} className="block w-full text-left p-2 hover:bg-gray-100 rounded">Food & Drinks</button>
              <button onClick={() => { setCurrentPage('parking'); setShowMenu(false); }} className="block w-full text-left p-2 hover:bg-gray-100 rounded">Parking</button>
              <button onClick={() => { setCurrentPage('navigate'); setShowMenu(false); }} className="block w-full text-left p-2 hover:bg-gray-100 rounded">Navigate</button>
            </nav>
          </div>
        )}
      </header>

      {/* Active Alerts */}
      {alerts.filter(a => a.severity === 'critical' || a.severity === 'warning').length > 0 && (
        <div className="bg-red-100 border-b border-red-200 p-3">
          {alerts.filter(a => a.severity === 'critical' || a.severity === 'warning').slice(0, 2).map(alert => (
            <div key={alert.id} className="flex items-start gap-2 text-red-800 text-sm">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <span><strong>{alert.title}:</strong> {alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main>
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40">
        <div className="flex justify-around items-center">
          <NavButton icon={Home} label="Home" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
          <NavButton icon={Ticket} label="Ticket" active={currentPage === 'ticket'} onClick={() => setCurrentPage('ticket')} />
          <NavButton icon={Utensils} label="Food" active={currentPage === 'concessions'} onClick={() => setCurrentPage('concessions')} />
          <NavButton icon={Car} label="Parking" active={currentPage === 'parking'} onClick={() => setCurrentPage('parking')} />
          <NavButton icon={MapPin} label="Navigate" active={currentPage === 'navigate'} onClick={() => setCurrentPage('navigate')} />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${active ? 'text-bharat-saffron bg-orange-50' : 'text-gray-500'}`}>
      <Icon size={20} />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}

function HomePage({ event, alerts, onNavigate }) {
  return (
    <div className="p-4 space-y-4">
      {/* Event Info Card */}
      <div className="card bg-gradient-to-r from-bharat-saffron to-orange-500 text-white">
        <h2 className="text-2xl font-bold mb-2">{event?.name || 'Loading...'}</h2>
        <p className="opacity-90">
          {event?.start_time && new Date(event.start_time).toLocaleString('en-IN', {
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        <div className="mt-4 flex gap-2">
          <span className="badge bg-white/20">Live</span>
          <span className="badge bg-white/20">{event?.venue_name}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate('ticket')} className="card flex flex-col items-center p-4 active:scale-95 transition-transform">
          <Ticket size={32} className="text-bharat-saffron mb-2" />
          <span className="font-medium">My Ticket</span>
        </button>
        <button onClick={() => onNavigate('concessions')} className="card flex flex-col items-center p-4 active:scale-95 transition-transform">
          <Utensils size={32} className="text-bharat-saffron mb-2" />
          <span className="font-medium">Order Food</span>
        </button>
        <button onClick={() => onNavigate('parking')} className="card flex flex-col items-center p-4 active:scale-95 transition-transform">
          <Car size={32} className="text-bharat-saffron mb-2" />
          <span className="font-medium">Parking</span>
        </button>
        <button onClick={() => onNavigate('navigate')} className="card flex flex-col items-center p-4 active:scale-95 transition-transform">
          <MapPin size={32} className="text-bharat-saffron mb-2" />
          <span className="font-medium">Navigate</span>
        </button>
      </div>

      {/* Wait Times */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-3">Current Wait Times</h3>
        <div className="space-y-2">
          <WaitTimeRow name="Entry Gates" time="8 min" level="low" />
          <WaitTimeRow name="Security Check" time="12 min" level="medium" />
          <WaitTimeRow name="Restrooms" time="5 min" level="low" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
        <p className="text-blue-700 text-sm">Security: +91 98765 43210</p>
        <p className="text-blue-700 text-sm">Medical: +91 98765 43211</p>
      </div>
    </div>
  );
}

function WaitTimeRow({ name, time, level }) {
  const colors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100'
  };

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-700">{name}</span>
      <span className={`px-2 py-1 rounded text-sm font-medium ${colors[level]}`}>{time}</span>
    </div>
  );
}

function TicketPage({ ticket, venue }) {
  if (!ticket) {
    return (
      <div className="p-4 text-center">
        <Ticket size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Ticket Found</h2>
        <p className="text-gray-600">Please scan your QR code or enter ticket ID</p>
        <input type="text" placeholder="Enter QR Code" className="input-field mt-4" />
        <button className="btn-primary w-full mt-4">Load Ticket</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="card bg-white">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">{ticket.event_name}</h2>
          <p className="text-gray-600">{ticket.venue_name}</p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase">Section</p>
              <p className="text-2xl font-bold text-bharat-saffron">{ticket.section}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Row</p>
              <p className="text-2xl font-bold">{ticket.row}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Seat</p>
              <p className="text-2xl font-bold">{ticket.seat}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-gray-100 inline-block p-4 rounded-lg">
            <p className="font-mono text-lg">{ticket.qr_code}</p>
          </div>
          <p className="text-sm text-gray-500 mt-2">Show this QR code at the entrance</p>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span>{new Date(ticket.start_time).toLocaleDateString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500">Status</span>
            <span className="badge badge-success">{ticket.status}</span>
          </div>
        </div>
      </div>

      <button className="btn-primary w-full mt-4">Get Directions to Seat</button>
    </div>
  );
}

function ConcessionsPage({ concessions }) {
  const [selectedConcession, setSelectedConcession] = useState(null);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Food & Beverages</h2>

      <div className="space-y-3">
        {concessions.map(concession => (
          <div key={concession.id} className="card flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{concession.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{concession.type}</p>
              <div className="flex gap-2 mt-2">
                <span className="badge badge-info">{concession.queue_length} in queue</span>
                <span className="badge badge-warning">~{concession.current_wait_time} min wait</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedConcession(concession)}
              className="btn-primary text-sm py-2 px-4"
            >
              Order
            </button>
          </div>
        ))}
      </div>

      {selectedConcession && (
        <OrderModal
          concession={selectedConcession}
          onClose={() => setSelectedConcession(null)}
        />
      )}
    </div>
  );
}

function OrderModal({ concession, onClose }) {
  const [items, setItems] = useState([]);
  const menu = [
    { id: 1, name: 'Vada Pav', price: 50 },
    { id: 2, name: 'Samosa', price: 40 },
    { id: 3, name: 'Cold Drink', price: 60 },
    { id: 4, name: 'Popcorn', price: 80 },
    { id: 5, name: 'Ice Cream', price: 70 }
  ];

  const toggleItem = (item) => {
    if (items.find(i => i.id === item.id)) {
      setItems(items.filter(i => i.id !== item.id));
    } else {
      setItems([...items, item]);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const placeOrder = async () => {
    alert('Order placed! You will be notified when ready.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-4 border-b">
          <h3 className="font-bold text-lg">{concession.name}</h3>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">✕</button>
        </div>

        <div className="p-4">
          <h4 className="font-medium mb-3">Select Items</h4>
          <div className="space-y-2">
            {menu.map(item => (
              <label key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <span>{item.name} - ₹{item.price}</span>
                <input
                  type="checkbox"
                  checked={items.some(i => i.id === item.id)}
                  onChange={() => toggleItem(item)}
                  className="w-5 h-5"
                />
              </label>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={items.length === 0}
            className="btn-primary w-full mt-4 disabled:opacity-50"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

function ParkingPage({ parking }) {
  const totalSpots = parking.reduce((sum, p) => sum + p.total, 0);
  const availableSpots = parking.reduce((sum, p) => sum + p.available, 0);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Parking</h2>

      <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="opacity-90">Available Spots</p>
            <p className="text-4xl font-bold">{availableSpots}</p>
          </div>
          <div className="text-right">
            <p className="opacity-90">Total Capacity</p>
            <p className="text-2xl">{totalSpots}</p>
          </div>
        </div>
      </div>

      <h3 className="font-semibold mb-3">Parking Sections</h3>
      <div className="space-y-2">
        {parking.map(section => (
          <div key={section.section} className="card flex items-center justify-between">
            <div>
              <h4 className="font-medium">Section {section.section}</h4>
              <p className="text-sm text-gray-500">{section.available} of {section.total} spots available</p>
            </div>
            <div className="text-right">
              <span className={`badge ${section.available > 10 ? 'badge-success' : section.available > 5 ? 'badge-warning' : 'badge-danger'}`}>
                {Math.round((section.available / section.total) * 100)}% free
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary w-full mt-4">Navigate to Nearest Parking</button>
    </div>
  );
}

function NavigationPage({ venue, concessions }) {
  const destinations = [
    { name: 'My Seat', icon: Ticket },
    { name: 'Nearest Restroom', icon: User },
    { name: 'Food Court', icon: Utensils },
    { name: 'Parking', icon: Car },
    { name: 'First Aid', icon: AlertTriangle },
    { name: 'Exit', icon: MapPin }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Navigate Venue</h2>

      <div className="card bg-gray-100 h-48 mb-4 flex items-center justify-center">
        <p className="text-gray-500">Map View (Interactive)</p>
      </div>

      <h3 className="font-semibold mb-3">Quick Destinations</h3>
      <div className="space-y-2">
        {destinations.map((dest, index) => (
          <button key={index} className="card w-full flex items-center gap-4 active:scale-98 transition-transform">
            <div className="w-10 h-10 bg-bharat-saffron/10 rounded-full flex items-center justify-center">
              <dest.icon size={20} className="text-bharat-saffron" />
            </div>
            <span className="font-medium">{dest.name}</span>
            <span className="ml-auto text-gray-400">→</span>
          </button>
        ))}
      </div>

      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 text-sm">
          <strong>Pro Tip:</strong> Use the AR Navigation feature for turn-by-turn guidance to your destination.
        </p>
      </div>
    </div>
  );
}

export default App;
