import React, { useState } from 'react';
import DebitCard from '../components/DebitCard';
import { ShieldCheck, Snowflake, Settings, Lock, Cpu, Eye, ChevronRight } from 'lucide-react';

const Cards = () => {
  const [settings, setSettings] = useState([
    { id: 'online', name: 'Online Transactions', desc: 'Secure online/e-commerce gateway payments', status: true },
    { id: 'intl', name: 'International Usage', desc: 'Enable card for global ATM & POS terminals', status: false },
    { id: 'tap', name: 'Contactless Payments', desc: 'Tap-and-pay NFC limits up to ₹5,000', status: true }
  ]);

  const toggleSetting = (id) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, status: !s.status } : s));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Your Digital Shield</h1>
          <p className="text-slate-400 mt-1 text-sm">Security and controls over your physical and virtual debit instruments</p>
        </div>
        
        <button className="bg-primary hover:bg-white text-slate-950 font-bold px-6 py-3 rounded-xl shadow-glow-teal hover:shadow-white/20 transition-all duration-300 active:scale-95 text-sm uppercase tracking-wider">
           Request New Card
        </button>
      </div>

      {/* ── Cards Display & Controls ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
         
         {/* Left Side: Debit Card & Quick Controls */}
         <div className="space-y-6">
            <DebitCard />
            
            <div className="glass-panel rounded-2xl border border-slate-800 p-6">
               <h3 className="text-sm font-extrabold text-slate-400 mb-6 uppercase tracking-wider font-mono">Quick Firewalls</h3>
               <div className="grid grid-cols-3 gap-4">
                  
                  <button className="flex flex-col items-center justify-center p-4 bg-red-950/20 border border-red-500/20 hover:border-red-500/50 rounded-xl group transition-all shadow-sm">
                     <Lock className="text-red-400 mb-2 group-hover:scale-110 transition-transform shadow-glow-red" size={20} />
                     <span className="text-[10px] font-bold font-mono uppercase text-red-300 tracking-wider">Lock Card</span>
                  </button>
                  
                  <button className="flex flex-col items-center justify-center p-4 bg-blue-950/20 border border-blue-500/20 hover:border-blue-500/50 rounded-xl group transition-all shadow-sm">
                     <Snowflake className="text-primary mb-2 group-hover:scale-110 transition-transform shadow-glow-teal" size={20} />
                     <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-wider">Freeze</span>
                  </button>
                  
                  <button className="flex flex-col items-center justify-center p-4 bg-cyber-green/5 border border-cyber-green/20 hover:border-cyber-green/50 rounded-xl group transition-all shadow-sm">
                     <Settings className="text-cyber-green mb-2 group-hover:scale-110 transition-transform shadow-glow-green" size={20} />
                     <span className="text-[10px] font-bold font-mono uppercase text-cyber-green tracking-wider">Limits</span>
                  </button>
                  
               </div>
            </div>
         </div>

         {/* Right Side: Security Toggles & Virtual Cards */}
         <div className="space-y-6">
            
            {/* Security Settings List */}
            <div className="glass-panel rounded-2xl border border-slate-800 p-6">
               <h3 className="text-sm font-extrabold text-slate-400 mb-6 uppercase tracking-wider font-mono">Security Gateways</h3>
               <div className="space-y-6">
                  {settings.map(setting => (
                    <div key={setting.id} className="flex items-center justify-between py-1.5 border-b border-slate-800/40 last:border-b-0">
                       <div className="pr-4">
                          <p className="font-bold text-white text-sm">{setting.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-normal">{setting.desc}</p>
                       </div>
                       
                       {/* Sleek toggle switch */}
                       <button 
                         onClick={() => toggleSetting(setting.id)}
                         className={`w-12 h-6 rounded-full relative transition-colors duration-300 shrink-0 ${
                           setting.status ? 'bg-primary shadow-glow-teal' : 'bg-slate-800 border border-slate-700'
                         }`}
                       >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                            setting.status ? 'left-7 bg-slate-950' : 'left-1 bg-slate-400'
                          }`}></div>
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            {/* Virtual Card Generation Promo */}
            <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-slate-900 to-slate-950 p-6 text-white overflow-hidden shadow-glow-teal group">
               {/* Accent circle */}
               <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
               
               <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                     <div className="p-3 bg-primary/15 border border-primary/30 rounded-xl shrink-0">
                        <Cpu className="text-primary text-glow-teal" size={22} />
                     </div>
                     <div>
                        <p className="text-sm font-black tracking-tight text-white">Generate One-Time Virtual Card</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-normal">Instantly issue ephemeral tokens for safe merchant trials</p>
                     </div>
                  </div>
                  <button className="bg-primary hover:bg-white text-slate-950 font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap active:scale-95">
                     Generate
                  </button>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default Cards;
