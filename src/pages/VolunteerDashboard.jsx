import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, CheckCircle, Navigation, Loader2 } from 'lucide-react';

export default function VolunteerDashboard() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('volunteers').select('*').eq('id', userId).single();
    if (data) {
      setProfile(data);
      if (data.is_active !== undefined) setIsActive(data.is_active);
    }
  };

  const fetchIncidents = async () => {
    const { data } = await supabase.from('incidents').select('*').neq('status', 'resolved').order('created_at', { ascending: false });
    if (data) setIncidents(data);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/volunteer/login');
      } else {
        setSession(session);
        fetchProfile(session.user.id);
        fetchIncidents();
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/volunteer/login');
      setSession(session);
    });

    const channel = supabase.channel('dashboard_incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIncidents(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setIncidents(prev => prev.map(i => i.id === payload.new.id ? payload.new : i));
        }
      })
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleStatus = async () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    if (profile) {
      await supabase.from('volunteers').update({ is_active: newStatus }).eq('id', profile.id);
    }
  };

  const assignToIncident = async (incidentId) => {
    if (!profile) return;
    await supabase.from('incidents').update({
      status: 'dispatching',
      volunteer_name: profile.name,
      // eslint-disable-next-line react-hooks/purity
      volunteer_eta: Math.floor(Math.random() * 5) + 2
    }).eq('id', incidentId);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center text-slate-400"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto">
      <div className={`glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 transition-colors ${isActive ? 'border-l-emerald-500 bg-white/60' : 'border-l-slate-400 bg-slate-100'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border shadow-lg text-xl font-bold uppercase transition-colors ${isActive ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-slate-300 text-slate-500 border-slate-400'}`}>
            {profile?.name?.charAt(0) || session?.user?.email?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome, {profile?.name || 'Responder'}</h1>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
              {isActive ? (
                <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Duty: {profile?.profession || 'Volunteer'}</>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-slate-400" /> Offline / Off-Duty</>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className={`text-sm font-bold ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
              {isActive ? 'Available' : 'Offline'}
            </span>
            <button 
              onClick={toggleStatus}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors border border-slate-300">
            Sign Out
          </button>
        </div>
      </div>

      {!isActive ? (
        <div className="glass-panel rounded-2xl flex-1 flex flex-col items-center justify-center text-slate-500 p-8 border border-slate-300 border-dashed">
          <Shield size={48} className="text-slate-300 mb-4" />
          <p className="font-semibold text-lg text-slate-700">You are currently offline.</p>
          <p className="text-sm">Toggle your status to Active to view and accept emergency dispatches.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="text-indigo-500" size={20} /> Active Dispatch Requests
          </h2>
        
        {incidents.length === 0 ? (
          <div className="glass-panel rounded-2xl flex-1 flex flex-col items-center justify-center text-slate-500 p-8 border border-slate-200 border-dashed">
            <CheckCircle size={48} className="text-emerald-500/50 mb-4" />
            <p className="font-semibold text-lg">No active emergencies in your sector.</p>
            <p className="text-sm">Stay alert. When an SOS is triggered, it will appear here immediately.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {incidents.map(inc => (
              <div key={inc.id} className="glass-card rounded-2xl p-5 flex flex-col gap-4 border border-slate-200 relative overflow-hidden bg-white">
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  inc.status === 'reported' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded border border-red-100">
                      {inc.type}
                    </span>
                    <h3 className="font-bold text-slate-900 mt-3 leading-tight">{inc.reporter_name} requested help</h3>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                    inc.status === 'reported' ? 'border-red-200 text-red-500 bg-red-50' : 'border-amber-200 text-amber-500 bg-amber-50'
                  }`}>
                    {inc.status}
                  </span>
                </div>

                <div className="text-sm text-slate-600 flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-mono text-xs">
                    Lat: {inc.latitude?.toFixed(5)}<br/>
                    Lng: {inc.longitude?.toFixed(5)}
                  </span>
                </div>

                <div className="mt-auto pt-2">
                  {inc.status === 'reported' ? (
                    <button 
                      onClick={() => assignToIncident(inc.id)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
                    >
                      <Navigation size={18} /> Accept & Dispatch
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-slate-200">
                      Assigned to {inc.volunteer_name || 'Another Responder'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
