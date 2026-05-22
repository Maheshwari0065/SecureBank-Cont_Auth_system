import React from 'react';
import { 
  Bell, 
  Lock, 
  Smartphone, 
  ShieldCheck, 
  ChevronRight,
  Database,
  Eye,
  LogOut,
  ShieldAlert
} from 'lucide-react';

const Settings = () => {
  const sections = [
    {
      title: 'Security Gateways',
      items: [
        { name: 'Change Access Code', desc: 'Update your login password regularly to protect your vault', icon: <Lock className="text-primary" /> },
        { name: 'Two-Factor Authentication', desc: 'Multi-factor dynamic OTP shield enabled', icon: <ShieldCheck className="text-cyber-green" />, status: 'ACTIVE' },
        { name: 'Biometric Keystroke Profile', desc: 'Dynamic continuous authorization profile active', icon: <Database className="text-cyber-purple" /> }
      ]
    },
    {
      title: 'Preferences',
      items: [
        { name: 'Intruder Alert Notifications', desc: 'Control which security event signals ping your devices', icon: <Bell className="text-cyber-amber" /> },
        { name: 'SOC Auditing Ledger', desc: 'View complete user session log history', icon: <Eye className="text-primary" /> },
        { name: 'Linked Nodes', desc: 'Manage terminals and user agents authorized to handshake', icon: <Smartphone className="text-cyber-green" />, status: '2 ACTIVE' }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div>
         <h1 className="text-2xl font-extrabold text-white tracking-tight">System Settings</h1>
         <p className="text-slate-400 mt-1 text-sm font-sans">Configure visual states, transaction limits, and behavioral verification parameters</p>
      </div>

      <div className="space-y-8">
         {sections.map(section => (
            <div key={section.title} className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              
              <div className="px-8 py-4 bg-slate-900/60 border-b border-slate-800/80">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">{section.title}</h3>
              </div>
              
              <div className="divide-y divide-slate-800/50">
                 {section.items.map(item => (
                   <button key={item.name} className="w-full flex items-center justify-between px-8 py-5 hover:bg-slate-900/30 transition-all duration-300 group">
                      <div className="flex items-center space-x-6 min-w-0">
                         <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                            {item.icon}
                         </div>
                         <div className="text-left min-w-0">
                            <p className="font-bold text-white text-sm truncate">{item.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-normal truncate">{item.desc}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 shrink-0">
                         {item.status && (
                           <span className="text-[9px] font-bold font-mono tracking-widest bg-cyber-green/10 text-cyber-green border border-cyber-green/20 px-2 py-0.5 rounded">
                             {item.status}
                           </span>
                         )}
                         <ChevronRight className="text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" size={16} />
                      </div>
                   </button>
                 ))}
              </div>
              
            </div>
         ))}

         {/* ── Danger Zone ────────────────────────────────────────────── */}
         <div className="glass-panel rounded-2xl border border-red-950/40 p-8 shadow-glow-red relative overflow-hidden group">
            {/* Ambient Red glow inside card */}
            <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-red-900/5 rounded-full blur-3xl"></div>

            <div className="flex items-center space-x-4 mb-4">
               <div className="h-10 w-10 rounded-xl bg-red-950/60 border border-red-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="text-red-400 text-glow-red" size={20} />
               </div>
               <div>
                  <h3 className="text-base font-extrabold text-white">Danger Containment</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Critical destructive procedures. Exercise caution.</p>
               </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
               <button className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 active:scale-95">
                  <LogOut size={14} className="text-red-400" />
                  <span>LOGOUT ALL TERMINALS</span>
               </button>
               <button className="bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 active:scale-95">
                  DECOMMISSION ACCOUNT
               </button>
            </div>
         </div>
      </div>
      
    </div>
  );
};

export default Settings;
