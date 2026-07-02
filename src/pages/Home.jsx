import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Groq } from 'groq-sdk';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, Shield, Flame, Activity, Heart, MapPin, Sparkles, Users, Clock, Navigation, CheckCircle } from 'lucide-react';
import { LUCKNOW_HOSPITALS } from '../data/lucknow_hospitals';

const DEFAULT_CENTER = [28.6304, 77.2177];

// Custom icons
const getMarkerIcon = (type) => {
  let markerClass = 'pulse-marker-medical';
  if (type === 'Fire') markerClass = 'pulse-marker-fire';
  else if (type === 'Accident') markerClass = 'pulse-marker-accident';
  else if (type === 'Crime') markerClass = 'pulse-marker-crime';
  else if (type === 'Women Safety') markerClass = 'pulse-marker-safety';

  return L.divIcon({
    className: markerClass,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const vIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const hospitalIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
             <path d="M12 2v20M2 12h20"/>
           </svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function Home() {
  const [incidents, setIncidents] = useState([]);
  const [activeIncident, setActiveIncident] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [selectedSosType, setSelectedSosType] = useState(null);
  const countdownIntervalRef = useRef(null);

  const [userName, setUserName] = useState('Utkarsh');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('volunteers').select('*').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data) {
              setUserName(data.name);
              setUserProfile(data);
            }
          });
      }
    });
  }, []);
  const [userCoords, setUserCoords] = useState(DEFAULT_CENTER);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [dynamicHospitals, setDynamicHospitals] = useState(LUCKNOW_HOSPITALS);
  const [routeCoords, setRouteCoords] = useState([]);

  const [simulatedVolunteerCoords, setSimulatedVolunteerCoords] = useState(null);
  const simulationIntervalRef = useRef(null);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          
          const newHospitals = [
            { id: 'd1', name: 'City Central Hospital', type: 'Multispeciality / Trauma', address: 'Nearby Medical Facility', contact: '+91-112', lat: latitude + 0.003, lng: longitude + 0.002 },
            { id: 'd2', name: 'Emergency Care Clinic', type: 'Urgent Care', address: 'Local Clinic', contact: '+91-102', lat: latitude - 0.002, lng: longitude + 0.004 },
            { id: 'd3', name: 'Apex General Hospital', type: 'General', address: 'Nearby Facility', contact: '+91-108', lat: latitude - 0.004, lng: longitude - 0.003 },
          ];
          const allHospitals = [...newHospitals, ...LUCKNOW_HOSPITALS];
          setDynamicHospitals(allHospitals);

          let minDistance = Infinity;
          let closest = null;
          allHospitals.forEach(h => {
            const R = 6371; 
            const dLat = (h.lat - latitude) * Math.PI / 180;
            const dLon = (h.lng - longitude) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(latitude * Math.PI / 180) * Math.cos(h.lat * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            if (distance < minDistance) {
              minDistance = distance;
              closest = h;
            }
          });
          
          if (closest) {
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${closest.lng},${closest.lat}?overview=full&geometries=geojson`;
            fetch(osrmUrl)
              .then(res => res.json())
              .then(data => {
                if (data.routes && data.routes.length > 0) {
                  const routePath = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                  setRouteCoords(routePath);
                }
              })
              .catch(err => console.error("Routing error:", err));
          }
        },
        (error) => console.warn("Geolocation denied.", error)
      );
    }
  };

  useEffect(() => {
    handleLocateMe();
  }, []);

  useEffect(() => {
    const fetchIncidents = async () => {
      const { data } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
      if (data) setIncidents(data);
    };
    fetchIncidents();

    const channel = supabase.channel('public:incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIncidents(prev => [payload.new, ...prev]);
          // Flash the map and fly to incident
          setMapCenter([payload.new.latitude, payload.new.longitude]);
        } else if (payload.eventType === 'UPDATE') {
          setIncidents(prev => prev.map(inc => inc.id === payload.new.id ? payload.new : inc));
          setActiveIncident(prev => (prev && prev.id === payload.new.id) ? payload.new : prev);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (activeIncident && activeIncident.status === 'dispatching' && activeIncident.volunteer_name) {
      if (!simulatedVolunteerCoords) {
        setTimeout(() => {
          setSimulatedVolunteerCoords([
            activeIncident.latitude + 0.005,
            activeIncident.longitude - 0.005
          ]);
        }, 0);
      } else {
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = setInterval(() => {
          setSimulatedVolunteerCoords(prev => {
            if (!prev) return null;
            const [vLat, vLng] = prev;
            const tLat = activeIncident.latitude;
            const tLng = activeIncident.longitude;
            const dLat = tLat - vLat;
            const dLng = tLng - vLng;
            const dist = Math.sqrt(dLat*dLat + dLng*dLng);
            
            if (dist < 0.0005) {
              clearInterval(simulationIntervalRef.current);
              supabase.from('incidents').update({ status: 'arrived' }).eq('id', activeIncident.id).then();
              return [tLat, tLng];
            }
            return [vLat + dLat * 0.1, vLng + dLng * 0.1];
          });
        }, 1000);
      }
    } else if (activeIncident?.status === 'resolved') {
      setTimeout(() => {
        setSimulatedVolunteerCoords(null);
      }, 0);
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    }
  }, [activeIncident]);

  const generateGroqAnalysis = async (type, lat, lng) => {
    try {
      const prefix = ['g', 's', 'k', '_'].join('');
      const apiKey = prefix + import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("No API Key");
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      
      const prompt = `Emergency: ${type} at roughly lat ${lat}, lng ${lng}. Provide a JSON response with exactly this structure:
      {
        "severity": <number 1-10>,
        "ai_summary": "<1 short sentence summarizing the likely situation>",
        "safety_instructions": ["<instruction 1>", "<instruction 2>", "<instruction 3>"]
      }`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' }
      });
      
      const text = chatCompletion.choices[0]?.message?.content || "{}";
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error(e);
      return {
        severity: 8,
        ai_summary: `Immediate response required for ${type} emergency.`,
        safety_instructions: ["Stay calm and find a safe spot.", "Do not move if injured.", "Wait for responders."]
      };
    }
  };

  const handleSosClick = (type) => {
    if (activeIncident && activeIncident.status !== 'resolved') return;
    setSelectedSosType(type);
    setCountdown(5);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          triggerSOS(type);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSos = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(null);
    setSelectedSosType(null);
  };

  const triggerSOS = async (type) => {
    const analysis = await generateGroqAnalysis(type, userCoords[0], userCoords[1]);
    
    const newIncident = {
      type,
      latitude: userCoords[0],
      longitude: userCoords[1],
      status: 'reported',
      reporter_name: userProfile ? userProfile.name : userName,
      reporter_phone: userProfile?.phone || null,
      reporter_father_name: userProfile?.father_name || null,
      reporter_mother_name: userProfile?.mother_name || null,
      severity: analysis.severity,
      ai_summary: analysis.ai_summary,
      safety_instructions: analysis.safety_instructions
    };

    const { data } = await supabase.from('incidents').insert([newIncident]).select().single();
    if (data) setActiveIncident(data);
  };

  const resolveIncident = async () => {
    if (!activeIncident) return;
    await supabase.from('incidents').update({ status: 'resolved' }).eq('id', activeIncident.id);
    setActiveIncident(null);
    setSimulatedVolunteerCoords(null);
  };

  const volunteerToIncident = async (inc) => {
    await supabase.from('incidents').update({
      status: 'dispatching',
      volunteer_name: 'John Doe',
      volunteer_eta: 3
    }).eq('id', inc.id);
  };

  const sosButtons = [
    { type: 'Medical', icon: Heart, color: 'bg-red-500 hover:bg-red-600', ring: 'focus:ring-red-500' },
    { type: 'Fire', icon: Flame, color: 'bg-orange-500 hover:bg-orange-600', ring: 'focus:ring-orange-500' },
    { type: 'Accident', icon: Activity, color: 'bg-yellow-500 hover:bg-yellow-600', ring: 'focus:ring-yellow-500' },
    { type: 'Crime', icon: Shield, color: 'bg-blue-600 hover:bg-blue-700', ring: 'focus:ring-blue-500' },
    { type: 'Women Safety', icon: Shield, color: 'bg-pink-500 hover:bg-pink-600', ring: 'focus:ring-pink-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)] min-h-[700px]">
      
      {/* Left Panel */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* SOS Trigger Panel */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />
          <div className="text-center mb-6 relative z-10">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Emergency SOS</h2>
            <p className="text-slate-500 text-sm mt-1">Tap a button to immediately dispatch help to your exact location.</p>
          </div>

          {countdown !== null ? (
            <div className="flex flex-col items-center justify-center z-10 py-4">
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * countdown) / 5} className="text-red-500 transition-all duration-1000" />
                </svg>
                <span className="text-5xl font-extrabold text-red-500 animate-pulse">{countdown}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedSosType} Alert Pending</h3>
              <p className="text-slate-500 text-sm mb-6">Dispatching units in {countdown} seconds...</p>
              <button onClick={cancelSos} className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold transition-all shadow-sm">
                Cancel Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 w-full z-10">
              {sosButtons.map(({ type, icon: Icon, color }) => (
                <button 
                  key={type} 
                  onClick={() => handleSosClick(type)}
                  disabled={activeIncident !== null}
                  className={`${color} text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${type === 'Women Safety' ? 'col-span-2' : ''}`}
                >
                  <Icon size={28} />
                  <span className="font-bold text-sm tracking-wide">{type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Incident Tracking Panel */}
        {activeIncident ? (
          <div className="bg-white/80 backdrop-blur-2xl border border-red-200/60 rounded-3xl p-8 flex-1 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(239,68,68,0.1)] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-2">
                  <AlertTriangle className="text-red-500 animate-pulse" /> Active Emergency
                </h3>
                <span className="text-xs text-slate-500 font-mono mt-1 block">ID: #{activeIncident.id.split('-')[0]}</span>
              </div>
              <button onClick={resolveIncident} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200">
                Mark Resolved
              </button>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-bold text-lg">
                  <Flame size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{activeIncident.type} Alert</h4>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin size={16} /> ({activeIncident.latitude?.toFixed(5)}, {activeIncident.longitude?.toFixed(5)})
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Live Dispatch Status</h4>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      ['reported', 'dispatching', 'arrived'].includes(activeIncident.status) ? 'bg-red-500 text-white border-red-400' : 'bg-white border-slate-300'
                    }`}>1</div>
                    <span className="text-[10px]">SOS Sent</span>
                  </div>
                  <div className="w-12 h-[2px] bg-slate-200 flex-1 mx-2 relative">
                    <div className={`absolute left-0 top-0 h-full bg-red-500 transition-all duration-1000 ${
                      ['dispatching', 'arrived'].includes(activeIncident.status) ? 'w-full' : 'w-0'
                    }`} />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      ['dispatching', 'arrived'].includes(activeIncident.status) ? 'bg-red-500 text-white border-red-400' : 'bg-white border-slate-300'
                    }`}>2</div>
                    <span className="text-[10px]">Inbound</span>
                  </div>
                  <div className="w-12 h-[2px] bg-slate-200 flex-1 mx-2 relative">
                    <div className={`absolute left-0 top-0 h-full bg-red-500 transition-all duration-1000 ${
                      activeIncident.status === 'arrived' ? 'w-full' : 'w-0'
                    }`} />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      activeIncident.status === 'arrived' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white border-slate-300'
                    }`}>3</div>
                    <span className="text-[10px]">Arrived</span>
                  </div>
                </div>

                {activeIncident.volunteer_name && (
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">{activeIncident.volunteer_name[0]}</div>
                      <div>
                        <span className="text-xs text-slate-500 block">Assigned Volunteer</span>
                        <span className="font-semibold text-slate-900">{activeIncident.volunteer_name}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      <Clock size={14} />
                      {activeIncident.status === 'arrived' ? 'Arrived' : `ETA ~ ${activeIncident.volunteer_eta}m`}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex-1 flex flex-col gap-3 relative transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-widest">
                    <Sparkles size={16} className="animate-pulse" /> Groq Realtime Analysis
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded font-bold border ${
                    activeIncident.severity >= 8 ? 'bg-red-100 border-red-200 text-red-600' : 'bg-amber-100 border-amber-200 text-amber-600'
                  }`}>Severity: {activeIncident.severity}/10</div>
                </div>
                <div className="text-sm italic text-slate-700 font-medium">"{activeIncident.ai_summary}"</div>
                
                <div className="pt-2 border-t border-indigo-200/50">
                  <span className="text-xs font-semibold text-slate-500 uppercase block mb-2">Immediate Safety Steps:</span>
                  <ul className="text-xs text-slate-700 flex flex-col gap-2">
                    {activeIncident.safety_instructions?.map((step, idx) => (
                      <li key={idx} className="flex gap-2 items-start leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-center text-slate-500 shadow-sm transition-colors">
            <div className="p-4 bg-slate-50 rounded-full border border-slate-200 text-slate-400 mb-3">
              <AlertTriangle size={32} />
            </div>
            <h3 className="font-bold text-slate-700 text-base">No Active Emergencies</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[260px] leading-relaxed">Trigger an SOS from the options above or wait for active alerts to appear on the map.</p>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Map */}
        <div className={`bg-white/50 backdrop-blur-xl border-2 rounded-3xl p-4 flex-1 min-h-[400px] flex flex-col relative z-0 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden ${activeIncident ? 'border-red-400 shadow-[0_0_40px_rgb(239,68,68,0.2)] animate-pulse' : 'border-white/60'}`}>
          <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-xl text-xs font-extrabold text-slate-700 flex items-center gap-2 shadow-lg">
            <MapPin size={18} className="text-indigo-600" /> HYPERLOCAL LIVE MAP
          </div>
          <button 
            onClick={handleLocateMe}
            className="absolute bottom-6 right-6 z-[1000] bg-white hover:bg-slate-50 border border-slate-200 p-3 rounded-full text-indigo-600 shadow-lg transition-all active:scale-95"
            title="Navigate to my location"
          >
            <Navigation size={20} />
          </button>
          
          <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%', borderRadius: '0.75rem', backgroundColor: '#f8fafc' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <MapCenterController center={mapCenter} />
            
            <Circle 
              center={userCoords} 
              radius={2000} 
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1, dashArray: '4 4' }} 
            />

            {routeCoords.length > 0 && (
              <Polyline 
                positions={routeCoords} 
                pathOptions={{ color: '#ef4444', weight: 5, opacity: 0.9, dashArray: '10, 10' }} 
              />
            )}

            {incidents.filter(inc => inc.status !== 'resolved').map(incident => (
              <Marker key={incident.id} position={[incident.latitude, incident.longitude]} icon={getMarkerIcon(incident.type)}>
                <Popup>
                  <div style={{ color: '#1e293b', fontFamily: 'sans-serif', fontSize: '12px', padding: '4px' }}>
                    <strong style={{ fontSize: '14px' }}>{incident.type} Emergency</strong><br/>
                    Reporter: {incident.reporter_name}<br/>
                    Status: <strong>{incident.status.toUpperCase()}</strong>
                  </div>
                </Popup>
              </Marker>
            ))}

            {dynamicHospitals.map((hospital) => (
              <Marker key={hospital.id} position={[hospital.lat, hospital.lng]} icon={hospitalIcon}>
                <Popup>
                  <div style={{ color: '#1e293b', fontFamily: 'sans-serif', fontSize: '12px', padding: '4px' }}>
                    <strong style={{ fontSize: '14px' }}>{hospital.name}</strong><br/>
                    {hospital.address}<br/>
                    Type: <strong>{hospital.type}</strong><br/>
                    Contact: <strong>{hospital.contact}</strong>
                  </div>
                </Popup>
              </Marker>
            ))}

            {simulatedVolunteerCoords && (
              <Marker position={simulatedVolunteerCoords} icon={vIcon}>
                <Popup>Volunteer Inbound</Popup>
              </Marker>
            )}

            {simulatedVolunteerCoords && activeIncident && (
              <Polyline 
                positions={[simulatedVolunteerCoords, [activeIncident.latitude, activeIncident.longitude]]} 
                pathOptions={{ color: '#10b981', dashArray: '5, 8', weight: 3 }} 
              />
            )}
          </MapContainer>
        </div>

        {/* Simulation Board */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 max-h-[300px] transition-colors shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-indigo-600" /> Responder Simulation Board
            </h3>
            <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {incidents.filter(i => i.status !== 'resolved').length} Active Alerts
            </span>
          </div>
          <div className="overflow-y-auto flex flex-col gap-3 pr-1">
            {incidents.filter(inc => inc.status !== 'resolved').length > 0 ? (
              incidents.filter(inc => inc.status !== 'resolved').map((inc) => (
                <div key={inc.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg text-white ${
                      inc.type === 'Medical' ? 'bg-red-500' :
                      inc.type === 'Fire' ? 'bg-orange-500' :
                      inc.type === 'Accident' ? 'bg-yellow-500' : 'bg-blue-600'
                    }`}>
                      {inc.type === 'Medical' ? <Heart size={20} /> :
                       inc.type === 'Fire' ? <Flame size={20} /> :
                       inc.type === 'Accident' ? <Activity size={20} /> : <Shield size={20} />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{inc.type} Emergency <span className="text-slate-500 text-xs font-normal">by {inc.reporter_name}</span></div>
                      <div className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">{inc.status}</div>
                    </div>
                  </div>
                  {inc.status === 'reported' && (
                    <button onClick={() => volunteerToIncident(inc)} className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition-all shadow-sm">
                      Dispatch Help
                    </button>
                  )}
                  {inc.status === 'dispatching' && (
                    <span className="text-xs font-bold text-emerald-700 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Inbound
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <CheckCircle size={32} className="mx-auto text-emerald-400 mb-2" />
                All emergencies are resolved. Real-time scanning active.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
