import React, { useState, useEffect } from 'react';
import { Building2, Landmark, MoreHorizontal, User, Award, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../utils/api';

const Accounts = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get(`/api/account_summary/${user.user_id}`);
        setSummary(res.data.summary);
      } catch (err) {
        console.error("Accounts summary fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [user.user_id]);

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent shadow-glow-teal"></div>
    </div>
  );

  const accounts = [
    {
       name: 'Primary Savings',
       number: summary?.account_number,
       balance: summary?.savings_balance,
       type: 'Savings Account',
       ifsc: summary?.ifsc,
       branch: summary?.branch,
       icon: <Landmark className="text-primary h-5 w-5" />,
       color: 'border-t-primary',
       glow: 'shadow-glow-teal'
    },
    {
       name: 'Daily Expenses',
       number: summary?.account_number,
       balance: summary?.current_balance,
       type: 'Current Account',
       ifsc: summary?.ifsc,
       branch: summary?.branch,
       icon: <Building2 className="text-cyber-green h-5 w-5" />,
       color: 'border-t-cyber-green',
       glow: 'shadow-glow-green'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
         <h1 className="text-2xl font-extrabold text-white tracking-tight">My Bank Accounts</h1>
         <p className="text-slate-400 mt-1 text-sm">Manage and monitor your secure checking, savings, and deposit accounts in one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {accounts.map(acc => (
            <div key={acc.name} className={`glass-panel rounded-2xl border border-slate-800 p-8 border-t-2 ${acc.color} ${acc.glow} transition-all duration-300 hover:scale-[1.01]`}>
               <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-slate-900/80 border border-slate-700/50 rounded-xl flex items-center justify-center shrink-0">
                     {acc.icon}
                  </div>
                  <button className="text-slate-500 hover:text-white transition-colors">
                     <MoreHorizontal size={20} />
                  </button>
               </div>
               
               <div className="mb-8">
                  <p className="text-xs font-bold text-slate-500 font-mono tracking-widest uppercase mb-1">{acc.type}</p>
                  <h3 className="text-lg font-bold text-white leading-none">{acc.name}</h3>
                  <p className="text-3xl font-extrabold text-white mt-3 font-sans">
                    ₹{acc.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-6 border-t border-slate-800/80 text-xs font-mono">
                  <div>
                     <p className="text-slate-500 font-bold uppercase tracking-wider mb-1">Account Number</p>
                     <p className="font-bold text-slate-300">{acc.number}</p>
                  </div>
                  <div>
                     <p className="text-slate-500 font-bold uppercase tracking-wider mb-1">IFSC Code</p>
                     <p className="font-bold text-slate-300">{acc.ifsc}</p>
                  </div>
                  <div className="mt-2">
                     <p className="text-slate-500 font-bold uppercase tracking-wider mb-1">Branch</p>
                     <p className="font-bold text-slate-300 truncate">{acc.branch}</p>
                  </div>
                  <div className="mt-2">
                     <p className="text-slate-500 font-bold uppercase tracking-wider mb-1">Status</p>
                     <div className="flex items-center space-x-1.5">
                        <div className="h-2 w-2 rounded-full bg-cyber-green shadow-glow-green"></div>
                        <span className="font-bold text-cyber-green">ACTIVE</span>
                     </div>
                  </div>
               </div>
               
               <div className="flex space-x-4 mt-8">
                  <button className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider active:scale-95">Details</button>
                  <button className="flex-1 bg-primary hover:bg-white text-slate-950 font-bold py-3 rounded-xl transition-all shadow-glow-teal hover:shadow-white/10 text-xs uppercase tracking-wider active:scale-95">Statement</button>
               </div>
            </div>
         ))}
      </div>

      {/* ── Fixed Deposit Promotion Card ───────────────────────────── */}
      <div className="relative rounded-2xl border border-cyber-purple/20 bg-gradient-to-r from-cyber-purple/20 via-slate-900 to-cyber-purple/5 p-8 text-white overflow-hidden group shadow-glow-purple">
         {/* Ambient background decoration */}
         <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyber-purple/15 rounded-full blur-3xl opacity-60 group-hover:scale-110 transition-transform duration-700"></div>

         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
               <div className="h-14 w-14 rounded-xl bg-cyber-purple/25 border border-cyber-purple/40 flex items-center justify-center shrink-0">
                  <Award size={28} className="text-cyber-purple text-glow-purple" />
               </div>
               <div>
                  <h3 className="text-xl font-black tracking-tight">Open High-Yield Savings Account</h3>
                  <p className="text-slate-400 text-sm mt-1">Earn up to <span className="text-cyber-purple font-extrabold font-mono">7.5% interest p.a.</span> Grow your savings faster with our high-yielding interest rates.</p>
               </div>
            </div>
            
            <button className="bg-cyber-purple hover:bg-white text-white hover:text-slate-950 font-bold py-3 px-8 rounded-xl shadow-glow-purple hover:shadow-white/20 transition-all duration-300 flex items-center gap-2 active:scale-95 text-sm whitespace-nowrap">
               Invest Now
               <ChevronRight size={16} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default Accounts;
