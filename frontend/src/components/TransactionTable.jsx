import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const TransactionTable = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="text-center py-10 text-slate-500 font-mono">No transactions found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-slate-800">
            <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Date</th>
            <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Description</th>
            <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono text-right">Amount</th>
            <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {transactions.map((t, idx) => (
            <tr key={idx} className="group hover:bg-slate-900/40 transition-colors">
              <td className="py-4 pr-4">
                 <p className="text-xs font-bold text-slate-300 font-mono">{t.date}</p>
                 <p className="text-[9px] text-slate-500 font-mono">12:30 PM</p>
              </td>
              <td className="py-4">
                 <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl border shrink-0 ${
                      t.type === 'Credit' 
                        ? 'bg-cyber-green/5 border-cyber-green/20 text-cyber-green' 
                        : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                    }`}>
                       {t.type === 'Credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <div className="min-w-0">
                       <p className="text-xs font-bold text-slate-200 truncate">{t.description}</p>
                       <p className="text-[9px] font-bold tracking-widest text-slate-500 font-mono uppercase">{t.type}</p>
                    </div>
                 </div>
              </td>
              <td className={`py-4 text-right text-xs font-bold font-mono ${
                t.type === 'Credit' ? 'text-cyber-green text-glow-green' : 'text-slate-300'
              }`}>
                 {t.type === 'Credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
              </td>
              <td className="py-4 text-center">
                 <span className="inline-block px-2.5 py-0.5 bg-cyber-green/10 text-cyber-green text-[9px] font-bold tracking-widest uppercase rounded-full border border-cyber-green/20 font-mono">
                   Success
                 </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
