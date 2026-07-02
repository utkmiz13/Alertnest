import { useState } from 'react';
import { LUCKNOW_HOSPITALS } from '../data/lucknow_hospitals';
import { Building2, Search, Phone, MapPin, Activity } from 'lucide-react';

export default function Hospitals() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospitals = LUCKNOW_HOSPITALS.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 flex flex-col gap-6 h-full transition-colors">
      <div className="glass-panel bg-white/60 dark:bg-[#0b0f19]/40 border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="text-red-500" /> Lucknow Hospital Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Verified contact numbers for {LUCKNOW_HOSPITALS.length} major hospitals.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search hospital or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHospitals.map(hospital => (
            <div key={hospital.id} className="glass-card bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col gap-3 group transition-colors shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{hospital.name}</h3>
                <span className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {hospital.type.split('/')[0]}
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-400 dark:text-slate-500" /> {hospital.address}</span>
                <span className="flex items-center gap-2"><Activity size={14} className="text-slate-400 dark:text-slate-500" /> {hospital.type}</span>
              </div>
              
              <div className="mt-auto pt-4 flex gap-2">
                <a 
                  href={`tel:${hospital.contact}`} 
                  className="flex-1 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                >
                  <Phone size={16} /> {hospital.contact}
                </a>
              </div>
            </div>
          ))}
          {filteredHospitals.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No hospitals found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
