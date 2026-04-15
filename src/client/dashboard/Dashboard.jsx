import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Users, AlertTriangle, Utensils, Car, Activity, PlusCircle, CheckCircle } from 'lucide-react';

const socket = io();

function Dashboard() {
  const [venue, setVenue] = useState(null);
  const [event, setEvent] = useState(null);
  const [crowdZones, setCrowdZones] = useState([]);
  const [concessions, setConcessions] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  useEffect(() => {
    loadData();
    setupSocketListeners();

    // Simulate data updates every 5 seconds
    const interval = setInterval(() => {
      fetch('/api/simulate', { method: 'POST' });
    }, 5000);

    return () => {
      socket.off();
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    const [venueRes, eventRes, crowdRes, concessionsRes, incidentsRes, alertsRes, staffRes] = await Promise.all([
      fetch('/api/venue').then(r => r.json()),
      fetch('/api/event').then(r => r.json()),
      fetch('/api/crowd').then(r => r.json()),
      fetch('/api/concessions').then(r => r.json()),
      fetch('/api/incidents').then(r => r.json()),
      fetch('/api/alerts').then(r => r.json()),
      fetch('/api/staff').then(r => r.json())
    ]);
    setVenue(venueRes);
    setEvent(eventRes);
    setCrowdZones(crowdRes);
    setConcessions(concessionsRes);
    setIncidents(incidentsRes);
    setAlerts(alertsRes);
    setStaff(staffRes);
  };

  const setupSocketListeners = () => {
    socket.on('crowd_update', (zone) => {
      setCrowdZones(prev => prev.map(z => z.id === zone.id ? zone : z));
    });

    socket.on('concession_update', (concession) => {
      setConcessions(prev => prev.map(c => c.id === concession.id ? concession : c));
    });

    socket.on('incident_created', (incident) => {
      setIncidents(prev => [incident, ...prev]);
    });

    socket.on('incident_resolved', ({ id }) => {
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'resolved' } : i));
    });

    socket.on('alert_created', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });
  };

  const createAlert = async (alertData) => {
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        venueId: venue?.id,
        ...alertData
      })
    });
    setShowAlertModal(false);
    loadData();
  };

  const createIncident = async (incidentData) => {
    await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        venueId: venue?.id,
        ...incidentData
      })
    });
    setShowIncidentModal(false);
    loadData();
  };

  const resolveIncident = async (id) => {
    await fetch(`/api/incidents/${id}`, { method: 'PUT' });
    loadData();
  };

  const getDensityColor = (density) => {
    if (density < 0.3) return 'bg-green-500';
    if (density < 0.6) return 'bg-yellow-500';
    if (density < 0.8) return 'bg-orange-500';
    return 'bg-red-600';
  };

  const getDensityLabel = (density) => {
    if (density < 0.3) return 'Low';
    if (density < 0.6) return 'Moderate';
    if (density < 0.8) return 'High';
    return 'Critical';
  };

  const totalCapacity = venue?.capacity || 40000;
  const estimatedAttendance = Math.floor(totalCapacity * 0.75);
  const avgDensity = crowdZones.length > 0
    ? crowdZones.reduce((sum, z) => sum + z.current_density, 0) / crowdZones.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-bharat-saffron">Mission Bharat</h1>
            <p className="text-gray-400">Command Center</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Current Event</p>
              <p className="font-semibold">{event?.name || 'Loading...'}</p>
            </div>
            <div className="h-10 w-px bg-gray-700" />
            <button onClick={() => setShowAlertModal(true)} className="btn-primary flex items-center gap-2">
              <PlusCircle size={20} />
              Alert
            </button>
            <button onClick={() => setShowIncidentModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2">
              <AlertTriangle size={20} />
              Incident
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 p-4">
        <StatCard
          icon={Users}
          label="Estimated Attendance"
          value={estimatedAttendance.toLocaleString()}
          subtext={`${Math.round((estimatedAttendance / totalCapacity) * 100)}% of ${totalCapacity.toLocaleString()} capacity`}
          color="blue"
        />
        <StatCard
          icon={Activity}
          label="Average Crowd Density"
          value={`${Math.round(avgDensity * 100)}%`}
          subtext={getDensityLabel(avgDensity)}
          color={avgDensity > 0.7 ? 'red' : avgDensity > 0.4 ? 'yellow' : 'green'}
        />
        <StatCard
          icon={AlertTriangle}
          label="Active Incidents"
          value={incidents.filter(i => i.status === 'open').length}
          subtext={`${incidents.length} total today`}
          color="orange"
        />
        <StatCard
          icon={Utensils}
          label="Avg Concession Wait"
          value={`${Math.round(concessions.reduce((sum, c) => sum + c.current_wait_time, 0) / (concessions.length || 1))} min`}
          subtext={`${concessions.filter(c => c.current_wait_time > 10).length} locations busy`}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {/* Crowd Heatmap */}
        <div className="col-span-2 card bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-bharat-saffron" />
            Crowd Density Map
          </h2>
          <div className="relative bg-gray-700 rounded-lg h-80">
            {/* Venue outline */}
            <div className="absolute inset-4 border-2 border-gray-600 rounded-full opacity-30" />

            {/* Zone indicators */}
            {crowdZones.map(zone => (
              <div
                key={zone.id}
                className={`absolute w-8 h-8 rounded-full ${getDensityColor(zone.current_density)} flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-125 transition-transform`}
                style={{
                  left: `${zone.location_x}%`,
                  top: `${zone.location_y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`${zone.name}: ${getDensityLabel(zone.current_density)}`}
              >
                {Math.round(zone.current_density * 100)}%
              </div>
            ))}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-gray-900/90 rounded-lg p-3">
              <p className="text-xs font-medium mb-2">Density Legend</p>
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Low</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Moderate</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /> High</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-600" /> Critical</div>
              </div>
            </div>
          </div>

          {/* Zone Details */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {crowdZones.map(zone => (
              <div key={zone.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{zone.name}</p>
                  <p className="text-xs text-gray-400">Capacity: {zone.max_capacity?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${zone.current_density > 0.7 ? 'text-red-400' : zone.current_density > 0.4 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {getDensityLabel(zone.current_density)}
                  </p>
                  <p className="text-xs text-gray-400">{Math.round(zone.current_density * 100)}% full</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Active Incidents */}
          <div className="card bg-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-400" />
              Active Incidents
            </h2>
            {incidents.filter(i => i.status === 'open').length === 0 ? (
              <p className="text-gray-400 text-sm">No active incidents</p>
            ) : (
              <div className="space-y-2">
                {incidents.filter(i => i.status === 'open').map(incident => (
                  <div key={incident.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{incident.type}</p>
                        <p className="text-xs text-gray-400">{incident.description}</p>
                        <span className={`text-xs badge mt-1 ${
                          incident.severity === 'critical' ? 'badge-danger' :
                          incident.severity === 'high' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {incident.severity}
                        </span>
                      </div>
                      <button
                        onClick={() => resolveIncident(incident.id)}
                        className="text-green-400 hover:text-green-300"
                        title="Resolve"
                      >
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Concessions Status */}
          <div className="card bg-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Utensils size={20} className="text-green-400" />
              Concessions
            </h2>
            <div className="space-y-2">
              {concessions.map(c => (
                <div key={c.id} className="bg-gray-700 rounded-lg p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{c.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      c.current_wait_time > 10 ? 'bg-red-500/20 text-red-400' :
                      c.current_wait_time > 5 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {c.current_wait_time} min
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {c.queue_length} in queue
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Recent Alerts */}
        <div className="card bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-blue-400" />
            Recent Alerts
          </h2>
          {alerts.length === 0 ? (
            <p className="text-gray-400 text-sm">No alerts sent</p>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-400">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff Overview */}
        <div className="card bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users size={20} className="text-purple-400" />
            Staff Deployment
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {['security', 'medical', 'operations', 'concessions', 'usher'].map(role => {
              const count = staff.filter(s => s.role === role).length;
              return (
                <div key={role} className="bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-bharat-saffron">{count}</p>
                  <p className="text-xs text-gray-400 capitalize">{role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        <AlertModal
          onClose={() => setShowAlertModal(false)}
          onSubmit={createAlert}
        />
      )}

      {/* Incident Modal */}
      {showIncidentModal && (
        <IncidentModal
          onClose={() => setShowIncidentModal(false)}
          onSubmit={createIncident}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color }) {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    red: 'text-red-400 bg-red-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    purple: 'text-purple-400 bg-purple-500/10'
  };

  return (
    <div className="card bg-gray-800">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-500">{subtext}</p>
        </div>
      </div>
    </div>
  );
}

function AlertModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'info'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Create Emergency Alert</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="input-field bg-gray-700 border-gray-600 text-white"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="input-field bg-gray-700 border-gray-600 text-white"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Send Alert</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IncidentModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    type: 'medical',
    severity: 'medium',
    description: '',
    locationX: 50,
    locationY: 50
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      locationX: parseFloat(formData.locationX),
      locationY: parseFloat(formData.locationY)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Report Incident</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field bg-gray-700 border-gray-600 text-white"
            >
              <option value="medical">Medical</option>
              <option value="security">Security</option>
              <option value="maintenance">Maintenance</option>
              <option value="crowd">Crowd Control</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="input-field bg-gray-700 border-gray-600 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field bg-gray-700 border-gray-600 text-white"
              rows={3}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex-1">Report</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
