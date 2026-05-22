import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard as CardIcon,
  FileText,
  UserPlus,
  TrendingDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AccountCard from '../components/AccountCard';
import TransactionTable from '../components/TransactionTable';
import SpendingChart from '../components/SpendingChart';
import api from '../utils/api';

const Home = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [summary, setSummary] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, txnsRes] = await Promise.all([
          api.get(`/api/account_summary/${user.user_id}`),
          api.get(`/api/transactions/${user.user_id}`)
        ]);
        setSummary(summaryRes.data.summary);
        setTxns(txnsRes.data.transactions.slice(0, 5));
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.user_id]);

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[50vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent shadow-glow-teal"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Welcome Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-extrabold text-white tracking-tight">
             Good Morning, <span className="text-primary text-glow-teal">{user.full_name.split(' ')[0]}</span>!
           </h1>
           <p className="text-slate-400 mt-1.5 text-sm">Here is a secure overview of your accounts today.</p>
        </div>
        
        <div className="glass-panel p-3 rounded-xl border border-primary/20 shadow-glow-teal flex items-center space-x-3">
           <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <TrendingUp size={18} className="text-primary" />
           </div>
           <div>
              <p className="text-[9px] text-slate-400 uppercase font-mono tracking-wider font-bold">Credit Score</p>
              <p className="text-base font-extrabold text-white font-mono leading-none mt-0.5">
                782 <span className="text-xs text-cyber-green font-normal ml-1">+12</span>
              </p>
           </div>
        </div>
      </div>

      {/* ── Account Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <AccountCard 
            title="Savings Account" 
            balance={summary?.savings_balance} 
            accNumber={summary?.account_number} 
            color="bg-primary"
            icon={<DollarSign className="text-primary h-5 w-5" />}
         />
         <AccountCard 
            title="Current Account" 
            balance={summary?.current_balance} 
            accNumber={summary?.account_number} 
            color="bg-cyber-green"
            icon={<ArrowUpRight className="text-cyber-green h-5 w-5" />}
         />
         <AccountCard 
            title="Fixed Deposit" 
            balance={summary?.fd_balance} 
            accNumber="FD-8829-110" 
            color="bg-cyber-purple"
            icon={<CardIcon className="text-cyber-purple h-5 w-5" />}
         />
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { name: 'Send Money', icon: <DollarSign size={18}/>, color: 'bg-primary/10 border-primary/20 text-primary', path: '/dashboard/transfer' },
           { name: 'Accounts Summary', icon: <FileText size={18}/>, color: 'bg-cyber-purple/10 border-cyber-purple/20 text-cyber-purple', path: '/dashboard/accounts' },
           { name: 'Debit Control', icon: <CardIcon size={18}/>, color: 'bg-cyber-green/10 border-cyber-green/20 text-cyber-green', path: '/dashboard/cards' },
           { name: 'Account Statements', icon: <ArrowDownRight size={18}/>, color: 'bg-cyber-amber/10 border-cyber-amber/20 text-cyber-amber', path: '/dashboard/history' }
         ].map(action => (
           <Link 
             to={action.path}
             key={action.name} 
             className="flex flex-col items-center justify-center p-4 rounded-xl glass-panel-interactive border hover:border-slate-700/60 shadow-sm transition-all group"
           >
              <div className={`${action.color} border p-3 rounded-full mb-3 group-hover:scale-110 transition-transform`}>
                 {action.icon}
              </div>
              <span className="text-xs font-bold text-slate-300 text-center">{action.name}</span>
           </Link>
         ))}
      </div>

      {/* ── Analytics & Tables ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Recent Transactions */}
         <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-lg font-bold text-white tracking-tight">Recent Transactions</h3>
               <Link to="/history" className="text-xs font-bold text-primary hover:text-white transition-colors">View Transaction History</Link>
            </div>
            <TransactionTable transactions={txns} />
         </div>

         {/* Spending Analytics */}
         <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Monthly Spending Summary</h3>
              <div className="flex-1 w-full">
                 <SpendingChart />
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 font-mono">MONTHLY BUDGET LIMIT</span>
                  <span className="text-xs font-bold text-cyber-green font-mono">75%</span>
               </div>
               <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-cyber-green h-full rounded-full shadow-glow-teal" style={{ width: '75%' }}></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Home;
