import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Shield,
  Home,
  Building2,
  UserCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import AiSupportChat from "../components/AiSupportChat";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Toaster, toast } from 'react-hot-toast';

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Global Alert Listener
    const channel = supabase.channel('global_incidents_alert')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' }, (payload) => {
        const inc = payload.new;
        
        // Play an alarm sound
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play().catch(e => console.error("Audio play failed:", e));

        toast((t) => (
          <div className="flex flex-col gap-2 p-1 w-full min-w-[300px]">
            <div className="flex items-center gap-2 border-b pb-2 mb-1 border-slate-200">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="font-extrabold text-red-600 uppercase text-xs tracking-wider">🚨 NEW {inc.type} SOS 🚨</span>
            </div>
            <div className="text-sm font-semibold text-slate-800">
              Victim: {inc.reporter_name || 'Unknown'}
            </div>
            {inc.reporter_phone && (
              <div className="text-xs text-slate-600">
                📞 Phone: <span className="font-mono font-bold text-slate-900">{inc.reporter_phone}</span>
              </div>
            )}
            {(inc.reporter_father_name || inc.reporter_mother_name) && (
              <div className="text-xs text-slate-600">
                👪 Parents: {inc.reporter_father_name || 'N/A'} & {inc.reporter_mother_name || 'N/A'}
              </div>
            )}
            <div className="mt-2 text-xs bg-slate-100 p-2 rounded-lg font-mono text-slate-600 break-all">
              Location: {inc.latitude?.toFixed(4)}, {inc.longitude?.toFixed(4)}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="mt-3 w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold py-2 rounded-lg text-xs transition-colors"
            >
              Acknowledge
            </button>
          </div>
        ), {
          duration: 10000,
          position: 'top-right',
          style: {
            border: '2px solid #ef4444',
            padding: '16px',
            color: '#0f172a',
            boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.3)',
            borderRadius: '1rem',
          },
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  const navLinks = [
    { to: "/", icon: <Home size={18} />, label: "Live SOS" },
    { to: "/hospitals", icon: <Building2 size={18} />, label: "Hospitals" },
    {
      to: "/volunteer/dashboard",
      icon: <Shield size={18} />,
      label: "Volunteer Hub",
    },
  ];
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 relative transition-colors duration-300">
      {" "}
      {/* Top Navbar */}{" "}
      <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-2xl border-b border-slate-200 shadow-sm transition-colors duration-300">
        {" "}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {" "}
          <div className="flex items-center justify-between h-16">
            {" "}
            {/* Logo */}{" "}
            <div className="flex items-center gap-2.5">
              {" "}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                {" "}
                <Shield size={20} className="fill-white/20" />{" "}
              </div>{" "}
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900">
                Alert<span className="text-red-500">Nest</span>
              </h1>{" "}
            </div>{" "}
            {/* Desktop Nav */}{" "}
            <nav className="hidden md:flex items-center gap-1">
              {" "}
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-semibold ${isActive ? "bg-red-50 text-red-600 border border-red-200 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"}`
                  }
                >
                  {" "}
                  {link.icon} {link.label}{" "}
                </NavLink>
              ))}{" "}
            </nav>{" "}
            {/* Login Button (Desktop) */}{" "}
            <div className="hidden md:flex items-center gap-4">
              {" "}
              {user ? (
                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-slate-200 transition-colors shadow-sm">
                  {" "}
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                    {" "}
                    {user.email?.charAt(0) || "V"}{" "}
                  </div>{" "}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    {" "}
                    <LogOut size={14} /> Logout{" "}
                  </button>{" "}
                </div>
              ) : (
                <NavLink
                  to="/volunteer/login"
                  className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  {" "}
                  <UserCircle size={18} /> Login{" "}
                </NavLink>
              )}{" "}
            </div>{" "}
            {/* Mobile Menu Button */}{" "}
            <div className="flex items-center gap-2 md:hidden">
              {" "}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2"
              >
                {" "}
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Mobile Nav Dropdown */}{" "}
        <div
          className={`md:hidden absolute w-full bg-white/95 backdrop-blur-3xl border-b border-slate-200 transition-all duration-300 overflow-hidden shadow-xl ${isMobileMenuOpen ? "max-h-96 border-b" : "max-h-0 border-transparent"}`}
        >
          {" "}
          <div className="px-4 py-4 flex flex-col gap-2">
            {" "}
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${isActive ? "bg-red-50 text-red-600 border border-red-100" : "text-slate-600 hover:bg-slate-50"}`
                }
              >
                {" "}
                {link.icon} {link.label}{" "}
              </NavLink>
            ))}{" "}
            <div className="h-px bg-slate-100 my-2" />{" "}
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-200"
              >
                {" "}
                <LogOut size={18} /> Logout ({user.email?.split("@")[0]}){" "}
              </button>
            ) : (
              <NavLink
                to="/volunteer/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold"
              >
                {" "}
                <UserCircle size={18} /> Login / Register{" "}
              </NavLink>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </header>{" "}
      {/* Main Content Area */}{" "}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col relative z-10">
        {" "}
        <Outlet />{" "}
      </main>{" "}
      {/* Global AI Chatbot */} <AiSupportChat />{" "}
      {/* Background ambient glow */}{" "}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-500/5 blur-[150px] rounded-full pointer-events-none z-0" />{" "}
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none z-0" />{" "}
      <Toaster />
    </div>
  );
}
