import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { AlertTriangle, ArrowRight, Utensils, Car, Users, Clock } from 'lucide-react';

const socket = io();

function Signage() {
  const [venue, setVenue] = useState(null);
  const [event, setEvent] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [crowdZones, setCrowdZones] = useState([]);
  const [concessions, setConcessions] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadData();
    setupSocketListeners();

    // Update clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Auto-rotate slides
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 4);
    }, 15000);

    return () => {
      socket.off();
      clearInterval(timer);
      clearInterval(slideInterval);
    };
  }, []);

  const loadData = async () => {
    const [venueRes, eventRes, alertsRes, crowdRes, concessionsRes] = await Promise.all([
      fetch('/api/venue').then(r => r.json()),
      fetch('/api/event').then(r => r.json()),
      fetch('/api/alerts').then(r => r.json()),
      fetch('/api/crowd').then(r => r.json()),
      fetch('/api/concessions').then(r => r.json())
    ]);
    setVenue(venueRes);
    setEvent(eventRes);
    setAlerts(alertsRes);
    setCrowdZones(crowdRes);
    setConcessions(concessionsRes);
  };

  const setupSocketListeners = () => {
    socket.on('alert_created', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 5));
    });

    socket.on('crowd_update', (zone) => {
      setCrowdZones(prev => prev.map(z => z.id === zone.id ? zone : z));
    });

    socket.on('concession_update', (concession) => {
      setConcessions(prev => prev.map(c => c.id === concession.id ? concession : c));
    });
  };

  const getActiveAlert = () => {
    return alerts.find(a => a.severity === 'critical' || a.severity === 'warning') || alerts[0];
  };

  const activeAlert = getActiveAlert();

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Top Bar */}
      <div className="bg-bharat-saffron text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Vortex</h1>
          <span className="text-xl opacity-90">| {venue?.name}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-lg font-semibold">{event?.name || 'Loading...'}</p>
            <p className="text-sm opacity-80">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="text-4xl font-mono font-bold">
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      {activeAlert && (
        <div className={`p-6 ${
          activeAlert.severity === 'critical' ? 'bg-red-600 animate-pulse' :
          activeAlert.severity === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        }`}>
          <div className="flex items-center gap-4">
            <AlertTriangle size={48} className="flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold uppercase">{activeAlert.title}</h2>
              <p className="text-xl mt-1">{activeAlert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-280px)]">
          {/* Left Panel - Slide Show */}
          <div className="col-span-2 card bg-gray-800">
            {currentSlide === 0 && <VenueMapSlide crowdZones={crowdZones} />}
            {currentSlide === 1 && <ConcessionsSlide concessions={concessions} />}
            {currentSlide === 2 && <WaitTimesSlide concessions={concessions} />}
            {currentSlide === 3 && <EventInfoSlide event={event} venue={venue} />}

            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {[0, 1, 2, 3].map(i => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentSlide === i ? 'bg-bharat-saffron' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Panel - Static Info */}
          <div className="space-y-6">
            {/* Quick Directions */}
            <div className="card bg-gray-800 flex-1">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ArrowRight size={24} className="text-bharat-saffron" />
                Quick Directions
              </h3>
              <div className="space-y-4">
                <DirectionRow to="North Gate" time="3 min" status="clear" />
                <DirectionRow to="South Gate" time="5 min" status="moderate" />
                <DirectionRow to="Food Court" time="2 min" status="clear" />
                <DirectionRow to="Parking P1" time="7 min" status="busy" />
                <DirectionRow to="First Aid" time="4 min" status="clear" />
              </div>
            </div>

            {/* Capacity Status */}
            <div className="card bg-gray-800">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users size={24} className="text-bharat-saffron" />
                Venue Capacity
              </h3>
              <div className="text-center">
                <p className="text-5xl font-bold text-bharat-saffron">75%</p>
                <p className="text-gray-400 mt-2">of total capacity</p>
                <div className="mt-4 h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500 w-3/4" />
                </div>
              </div>
            </div>

            {/* Emergency Info */}
            <div className="card bg-red-900/30 border border-red-800">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" />
                Emergency
              </h3>
              <p className="text-sm text-gray-300 mb-2">In case of emergency:</p>
              <ul className="text-sm space-y-1 text-gray-400">
                <li>• Follow staff instructions</li>
                <li>• Use nearest exit</li>
                <li>• Do not run</li>
                <li>• Help those who need assistance</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">Security: +91 98765 43210</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-3">
        <div className="flex items-center gap-4 overflow-hidden">
          <span className="text-bharat-saffron font-bold flex-shrink-0">LIVE UPDATES:</span>
          <div className="overflow-hidden">
            <p className="animate-marquee whitespace-nowrap">
              Welcome to {event?.name} | Next match starts at 7:30 PM | Food Court wait times currently under 10 minutes | Parking Section P3 has available spots | Stay hydrated - water stations located at all concourses | Thank you for visiting {venue?.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectionRow({ to, time, status }) {
  const statusColors = {
    clear: 'text-green-400',
    moderate: 'text-yellow-400',
    busy: 'text-red-400'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
      <div className="flex items-center gap-3">
        <ArrowRight size={16} className="text-gray-400" />
        <span>{to}</span>
      </div>
      <div className="flex items-center gap-3">
        <Clock size={14} className="text-gray-400" />
        <span>{time}</span>
        <span className={`text-xs px-2 py-1 rounded ${statusColors[status]} bg-gray-800`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function VenueMapSlide({ crowdZones }) {
  const getDensityColor = (density) => {
    if (density < 0.3) return 'bg-green-500';
    if (density < 0.6) return 'bg-yellow-500';
    if (density < 0.8) return 'bg-orange-500';
    return 'bg-red-600';
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4">Venue Crowd Map</h3>
      <div className="flex-1 relative bg-gray-700 rounded-lg">
        <div className="absolute inset-8 border-2 border-gray-600 rounded-full opacity-30" />

        {crowdZones.map(zone => (
          <div
            key={zone.id}
            className={`absolute w-16 h-16 rounded-full ${getDensityColor(zone.current_density)} flex flex-col items-center justify-center text-center cursor-pointer hover:scale-110 transition-transform`}
            style={{
              left: `${zone.location_x}%`,
              top: `${zone.location_y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <span className="text-xs font-bold">{Math.round(zone.current_density * 100)}%</span>
            <span className="text-[10px] opacity-80">{zone.name}</span>
          </div>
        ))}

        <div className="absolute bottom-4 left-4 bg-gray-900/90 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Crowd Density</p>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-green-500" /> Low</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-yellow-500" /> Moderate</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-orange-500" /> High</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-red-600" /> Critical</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConcessionsSlide({ concessions }) {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Utensils size={24} className="text-bharat-saffron" />
        Food & Beverages
      </h3>
      <div className="grid grid-cols-2 gap-4 overflow-auto">
        {concessions.map(c => (
          <div key={c.id} className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-2">{c.name}</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 capitalize">{c.type}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                c.current_wait_time > 10 ? 'bg-red-500/20 text-red-400' :
                c.current_wait_time > 5 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {c.current_wait_time} min
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{c.queue_length} people in queue</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaitTimesSlide({ concessions }) {
  const avgWait = Math.round(concessions.reduce((sum, c) => sum + c.current_wait_time, 0) / (concessions.length || 1));

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4">Current Wait Times</h3>

      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 p-6 text-center">
          <p className="text-gray-400 mb-2">Average Food Wait</p>
          <p className="text-6xl font-bold text-green-400">{avgWait}</p>
          <p className="text-gray-400">minutes</p>
        </div>

        <div className="card bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-6 text-center">
          <p className="text-gray-400 mb-2">Entry Gate Wait</p>
          <p className="text-6xl font-bold text-blue-400">8</p>
          <p className="text-gray-400">minutes</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-6 text-center">
          <p className="text-gray-400 mb-2">Restroom Wait</p>
          <p className="text-6xl font-bold text-purple-400">5</p>
          <p className="text-gray-400">minutes</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 p-6 text-center">
          <p className="text-gray-400 mb-2">Security Check</p>
          <p className="text-6xl font-bold text-orange-400">12</p>
          <p className="text-gray-400">minutes</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-center">
          <span className="text-bharat-saffron font-bold">Tip:</span> Order food through the Vortex app to skip the queue!
        </p>
      </div>
    </div>
  );
}

function EventInfoSlide({ event, venue }) {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4">Event Information</h3>

      <div className="card bg-gradient-to-br from-bharat-saffron/20 to-orange-500/20 border border-bharat-saffron/30 p-8 text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">{event?.name}</h2>
        <p className="text-xl opacity-80">{venue?.name}</p>
        <div className="flex justify-center gap-4 mt-4">
          <span className="badge bg-bharat-saffron text-white px-4 py-2">LIVE</span>
          <span className="badge bg-white/20 px-4 py-2">
            {event?.start_time && new Date(event.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-gray-700 p-4">
          <h4 className="font-semibold mb-2">Gates Open</h4>
          <p className="text-2xl">1.5 hours</p>
          <p className="text-sm text-gray-400">before event</p>
        </div>
        <div className="card bg-gray-700 p-4">
          <h4 className="font-semibold mb-2">Estimated End</h4>
          <p className="text-2xl">11:00 PM</p>
          <p className="text-sm text-gray-400">tonight</p>
        </div>
        <div className="card bg-gray-700 p-4">
          <h4 className="font-semibold mb-2">Weather</h4>
          <p className="text-2xl">28°C</p>
          <p className="text-sm text-gray-400">Clear sky</p>
        </div>
        <div className="card bg-gray-700 p-4">
          <h4 className="font-semibold mb-2">Next Event</h4>
          <p className="text-lg">Apr 18, 7:30 PM</p>
          <p className="text-sm text-gray-400">RCB vs CSK</p>
        </div>
      </div>
    </div>
  );
}

export default Signage;
