import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

const StatusBadge = ({ status, ratio }) => {
  const isAnomaly = status === 'anomaly';
  const isUnusual = status === 'unusual';
  
  let label = "Normal";
  let color = "bg-cyber-green/10 text-cyber-green border-cyber-green/30 shadow-glow-green";
  let icon = <ShieldCheck size={14} className="mr-1.5 text-cyber-green" />;
  let dotColor = "bg-cyber-green";

  if (isAnomaly) {
    label = "Suspicious";
    color = "bg-red-950/40 text-red-400 border-red-500/30 shadow-glow-red";
    icon = <ShieldAlert size={14} className="mr-1.5 text-red-400" />;
    dotColor = "bg-red-500 animate-pulse";
  } else if (isUnusual) {
    label = "Unusual";
    color = "bg-cyber-amber/10 text-cyber-amber border-cyber-amber/30 shadow-glow-amber";
    icon = <Shield size={14} className="mr-1.5 text-cyber-amber" />;
    dotColor = "bg-cyber-amber";
  }

  return (
    <div className={`flex items-center px-4 py-2 rounded-full border text-xs font-bold font-mono tracking-widest uppercase transition-all duration-500 ${color}`}>
       {icon}
       <span className="mr-3">{label}</span>
       <div className="h-4 w-px bg-current opacity-20 mr-3"></div>
       <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full ${dotColor} mr-1.5`}></div>
          <span className="opacity-95">{Math.round((ratio || 0) * 100)}%</span>
       </div>
    </div>
  );
};

export default StatusBadge;
