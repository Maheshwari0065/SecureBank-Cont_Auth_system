import React from 'react';
import { MoreVertical } from 'lucide-react';

const AccountCard = ({ title, balance, accNumber, color, icon }) => {
  // Map color prop to specific neon glow classes and accents
  const isPrimary = color.includes('primary');
  const isFD = color.includes('014f59');
  
  let glowClass = "border-primary/20 hover:border-primary/50 shadow-glow-teal";
  let borderHighlight = "border-t-2 border-t-primary";
  let textGlow = "text-glow-teal";

  if (isFD) {
    glowClass = "border-cyber-purple/20 hover:border-cyber-purple/50 shadow-glow-purple";
    borderHighlight = "border-t-2 border-t-cyber-purple";
    textGlow = "text-glow-purple";
  } else if (!isPrimary) {
    glowClass = "border-cyber-green/20 hover:border-cyber-green/50 shadow-glow-green";
    borderHighlight = "border-t-2 border-t-cyber-green";
    textGlow = "text-glow-green";
  }

  return (
    <div className={`glass-panel-interactive rounded-2xl p-6 text-white border ${glowClass} ${borderHighlight} relative overflow-hidden group cursor-pointer`}>
       <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
             <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700/50 flex items-center justify-center shrink-0">
                {icon}
             </div>
             <button className="text-slate-400 hover:text-white transition-colors">
                <MoreVertical size={20} />
             </button>
          </div>
          
          <div>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 font-mono">{title}</p>
             <h4 className={`text-2xl font-black font-sans tracking-tight`}>
               ₹{parseFloat(balance || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
             </h4>
             <p className="text-[10px] text-slate-500 mt-4 font-mono tracking-widest">{accNumber}</p>
          </div>
       </div>

       {/* Premium background mesh grids & glow rings */}
       <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
       <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
    </div>
  );
};

export default AccountCard;
