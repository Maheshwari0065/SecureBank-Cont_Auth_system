import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../utils/api';
import TransactionTable from '../components/TransactionTable';

const History = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [txns, setTxns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxns = async () => {
      try {
        const res = await api.get(`/api/transactions/${user.user_id}`);
        setTxns(res.data.transactions);
      } catch (err) {
        console.error("History fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxns();
  }, [user.user_id]);

  const filteredTxns = txns.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Account Transactions Ledger</h1>
          <p className="text-slate-400 mt-1 text-sm">Detailed record of all debits, credits, and electronic money transfers.</p>
        </div>
        
        <button className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold font-mono text-slate-300 transition-all duration-300 active:scale-95">
           <Download size={14} />
           <span>DOWNLOAD CSV</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 p-6">
        
        {/* ── Search & Filter Controls ─────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by description or type..." 
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none transition-all font-mono text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-850 hover:border-slate-700 transition-colors font-mono">
               <Filter size={14} />
               <span>FILTERS</span>
            </button>
            <select className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-850 hover:border-slate-700 transition-colors outline-none cursor-pointer font-mono">
               <option>LAST 30 DAYS</option>
               <option>LAST 90 DAYS</option>
               <option>LAST 1 YEAR</option>
            </select>
          </div>
        </div>

        {/* ── Summary Stats (Split Panel) ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 p-6 bg-slate-900/60 rounded-xl border border-slate-800 font-mono">
           <div>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Total Credited</p>
              <p className="text-lg font-bold text-cyber-green text-glow-green flex items-center">
                 <ArrowDownRight size={16} className="mr-1 shrink-0" />
                 ₹45,312.00
              </p>
           </div>
           
           <div>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Total Debited</p>
              <p className="text-lg font-bold text-rose-400 flex items-center">
                 <ArrowUpRight size={16} className="mr-1 shrink-0" />
                 ₹4,649.00
              </p>
           </div>
           
           <div>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Savings Impact</p>
              <div className="flex items-center mt-2.5">
                 <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-cyber-green h-full rounded-full" style={{ width: '66%' }}></div>
                 </div>
                 <span className="ml-3 text-[10px] font-bold text-cyber-green">+12%</span>
              </div>
           </div>
           
           <div className="flex items-center">
              <button className="w-full bg-primary hover:bg-white text-slate-950 text-xs font-bold rounded-xl hover:shadow-white/10 shadow-glow-teal transition-all duration-300 py-3 uppercase tracking-widest active:scale-95">
                 Get Report
              </button>
           </div>
        </div>

        {/* ── Transactions Ledger ─────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent shadow-glow-teal"></div>
          </div>
        ) : (
          <TransactionTable transactions={filteredTxns} />
        )}
        
      </div>
    </div>
  );
};

export default History;
