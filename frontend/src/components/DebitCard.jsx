import React from 'react';
import { ShieldCheck } from 'lucide-react';

const DebitCard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div className="w-full h-56 bg-slate-900 border border-primary/20 rounded-2xl p-8 text-white shadow-glow-teal relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
       {/* Tech ambient glow */}
       <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-60 group-hover:scale-125 transition-transform duration-700"></div>

       <div className="absolute top-0 right-0 p-8">
          <ShieldCheck className="text-primary/20 h-16 w-16 group-hover:scale-110 transition-transform duration-500" />
       </div>

       <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary mb-1 font-mono">PLATINUM SECURE</p>
                <p className="text-xl font-extrabold tracking-tight">Secure<span className="text-primary">Bank</span></p>
             </div>
             {/* Glowing chip */}
             <div className="w-12 h-9 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 rounded-lg shadow-inner border border-amber-300/40 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
                <div className="w-8 h-6 border border-slate-950/20 rounded flex flex-wrap opacity-60">
                   <div className="w-1/2 border-r border-b border-slate-950/20"></div>
                   <div className="w-1/2 border-b border-slate-950/20"></div>
                   <div className="w-1/2 border-r border-slate-950/20"></div>
                   <div className="w-1/2"></div>
                </div>
             </div>
          </div>

          <div>
             <div className="flex space-x-4 mb-4 font-mono">
                <p className="text-xl font-bold tracking-[0.2em] text-slate-100">4532</p>
                <p className="text-xl font-bold tracking-[0.2em] text-slate-400">****</p>
                <p className="text-xl font-bold tracking-[0.2em] text-slate-400">****</p>
                <p className="text-xl font-bold tracking-[0.2em] text-primary text-glow-teal">9921</p>
             </div>
             
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 font-mono">Card Holder</p>
                   <p className="text-xs font-bold tracking-wide uppercase font-mono text-slate-300">{user.full_name || 'VALUED CUSTOMER'}</p>
                </div>
                <div>
                   <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 font-mono">Expires</p>
                   <p className="text-xs font-bold tracking-wide font-mono text-slate-300">09/29</p>
                </div>
                <div className="flex h-8 w-14 items-center justify-end relative">
                   <div className="h-6 w-6 rounded-full bg-rose-500/80 mix-blend-screen"></div>
                   <div className="h-6 w-6 rounded-full bg-amber-500/80 -ml-3 mix-blend-screen"></div>
                </div>
             </div>
          </div>
       </div>

       {/* Cyber grid network overlay */}
       <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%">
             <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
             </pattern>
             <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
       </div>
    </div>
  );
};

export default DebitCard;
