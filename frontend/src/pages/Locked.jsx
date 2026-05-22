import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, AlertTriangle, Terminal } from 'lucide-react';
import tracker from '../utils/tracker';

const Locked = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [lockReason, setLockReason] = useState('Unusual activity detected');

  useEffect(() => {
    tracker.stop();
    // Retrieve lock reason
    const reason = localStorage.getItem('auth_lock_reason');
    if (reason) {
      setLockReason(reason);
    }
  }, []);

  const handleLoginAgain = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_lock_reason');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans">
      {/* Red ambient warning glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-950/20 via-cyber-dark to-cyber-dark pointer-events-none z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="glass-panel py-8 px-6 shadow-glow-red rounded-2xl border border-red-500/20 text-center sm:px-10">
           
           <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-950/40 border border-red-500/30 mb-6 shadow-glow-red animate-pulse">
              <Lock className="h-9 w-9 text-red-500 text-glow-red" />
           </div>
           
           <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wider text-glow-red">
             Session Secured
           </h2>
           
           <p className="text-sm text-slate-400 mb-6">
             Our continuous biometric authentication system has temporarily locked your session to prevent unauthorized access.
           </p>
           
           {/* Detailed threat assessment report */}
           <div className="bg-slate-950 rounded-xl p-5 mb-8 text-left border border-slate-900 shadow-inner">
              <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-red-400 mb-4 pb-2 border-b border-slate-900">
                 <Terminal size={14} className="text-red-400" />
                 <span>Security Incident Report</span>
              </div>
              
              <div className="space-y-3.5 font-mono text-xs text-slate-400">
                 <div className="flex flex-col space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-600">Trigger Reason:</span>
                    <span className="text-red-300 font-bold bg-red-950/20 py-1.5 px-2.5 rounded border border-red-950/60 leading-relaxed">
                       {lockReason}
                    </span>
                 </div>
                 
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-600">Incident Timestamp:</span>
                    <span className="text-slate-300">{new Date().toLocaleTimeString()}</span>
                 </div>
                 
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-600">Secure Account ID:</span>
                    <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                       {user.account_number ? `****${user.account_number.slice(-4)}` : 'Unknown'}
                    </span>
                 </div>
              </div>
           </div>
           
           <button
             onClick={handleLoginAgain}
             className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-glow-red hover:shadow-red-500/30"
           >
             Authenticate Again
           </button>
           
           <p className="mt-4 text-[10px] text-slate-500">
             If you triggered this lockout by mistake (e.g. typing with one hand or with an unusual posture), please log in again to restore access.
           </p>
        </div>
      </div>
      
      <div className="mt-8 text-center flex justify-center items-center text-slate-500 z-10 relative">
         <ShieldAlert size={16} className="mr-2 text-red-500 animate-bounce" />
         <span className="font-black tracking-widest text-[10px] uppercase">SECUREBANK SESSION SECURED</span>
      </div>
    </div>
  );
};

export default Locked;
