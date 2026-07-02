import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, UserPlus, LogIn, Mail, Lock, User, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VolunteerLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [profession, setProfession] = useState('Civilian Volunteer');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/volunteer/dashboard');
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: name, profession }
          }
        });
        if (error) throw error;
        
        // Also insert into volunteers public table for app logic
        if (data.user) {
          const { error: dbError } = await supabase.from('volunteers').insert([
            { 
              id: data.user.id, 
              name, 
              email, 
              phone, 
              father_name: fatherName, 
              mother_name: motherName, 
              profession, 
              is_active: true 
            }
          ]);
          if (dbError) console.error("Could not insert volunteer profile:", dbError);
        }

        setMsg("Registration successful! Check your email to verify your account, or try logging in.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-[#0b0f19] to-slate-900">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-indigo-500" />
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl border border-slate-700 mb-4">
            <Shield size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Responder Hub</h2>
          <p className="text-slate-400 text-sm mt-2">Sign in to coordinate emergency responses and save lives.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm mb-4 font-medium">{error}</div>}
        {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-sm mb-4 font-medium">{msg}</div>}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              <div className="relative">
                <input required type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              <div className="flex gap-3">
                <div className="relative w-full">
                  <input required type="text" placeholder="Father's Name" value={fatherName} onChange={e => setFatherName(e.target.value)} className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500" />
                </div>
                <div className="relative w-full">
                  <input required type="text" placeholder="Mother's Name" value={motherName} onChange={e => setMotherName(e.target.value)} className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500" />
                </div>
              </div>
              <div className="relative">
                <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select value={profession} onChange={e => setProfession(e.target.value)} className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-red-500 appearance-none">
                  <option value="Civilian Volunteer">Civilian Volunteer</option>
                  <option value="Doctor">Doctor / Surgeon</option>
                  <option value="Nurse">Registered Nurse</option>
                  <option value="Paramedic">Paramedic / EMT</option>
                  <option value="Police">Police / Security</option>
                </select>
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input required type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500" />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500" />
          </div>

          <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2">
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register as Responder'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(null); setMsg(null); }} className="text-slate-400 hover:text-white text-sm transition-colors">
            {isLogin ? "Don't have an account? Register" : "Already registered? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
