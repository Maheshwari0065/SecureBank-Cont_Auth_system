import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Sliders, 
  Terminal, 
  Play, 
  MousePointer, 
  Keyboard, 
  Lock 
} from 'lucide-react';
import tracker from '../utils/tracker';

const SecurityHub = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // States
  const [threshold, setThreshold] = useState(
    parseFloat(localStorage.getItem('auth_lock_threshold') || '0.6')
  );
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [inactivityCountdown, setInactivityCountdown] = useState(30);
  const [latestStats, setLatestStats] = useState({ ratio: 0, status: 'normal' });
  
  const terminalEndRef = useRef(null);

  // Initialize and load historical verification logs
  useEffect(() => {
    const loadLogs = () => {
      const stored = localStorage.getItem('auth_verification_history') || '[]';
      const parsed = JSON.parse(stored);
      setHistory(parsed);
      if (parsed.length > 0) {
        const last = parsed[parsed.length - 1];
        setLatestStats({ ratio: last.ratio, status: last.status });
      }
    };
    
    loadLogs();
    
    // Listen to verification updates
    const handleAuthUpdate = (e) => {
      loadLogs();
    };
    window.addEventListener('auth_status', handleAuthUpdate);
    
    // Listen to live raw telemetry for scrolling logs
    const handleRawTelemetry = (e) => {
      const data = e.detail;
      const logLine = `[${new Date().toLocaleTimeString()}] RHYTHM ANALYSIS: press_duration=${Math.round(data.hold_time)}ms | key_transition=${Math.round(data.flight_time)}ms | mouse_speed=${data.mouse_speed.toFixed(2)}px/ms | clicks=${data.click_count}`;
      
      setLogs(prev => [logLine, ...prev].slice(0, 40));
    };
    window.addEventListener('biometric_telemetry', handleRawTelemetry);

    // Inactivity timer visualization
    const interval = setInterval(() => {
      if (tracker.lastInteractionTime) {
        const elapsedSec = Math.floor((Date.now() - tracker.lastInteractionTime) / 1000);
        setInactivityCountdown(Math.max(30 - elapsedSec, 0));
      }
    }, 500);

    return () => {
      window.removeEventListener('auth_status', handleAuthUpdate);
      window.removeEventListener('biometric_telemetry', handleRawTelemetry);
      clearInterval(interval);
    };
  }, []);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    localStorage.setItem('auth_lock_threshold', val);
    setThreshold(val);
  };

  const handleBotAttack = () => {
    // CRITICAL lock — goes directly to /locked screen (no Step-Up modal)
    // Message matches 'Automated/Fast typing' critical trigger in App.jsx
    tracker.triggerLock("Automated/Fast typing detected (simulated bot-typing attack)");
  };

  const handleIntruderSim = () => {
    // SOFT anomaly — triggers the Step-Up MFA modal in DashboardLayout
    // Dispatches a custom auth_status event with anomaly status but no critical message
    const softAnomaly = new CustomEvent('auth_status', {
      detail: {
        status: 'anomaly',
        anomaly_ratio: 0.85,
        message: 'Biometric model mismatch detected — typing pattern deviation exceeds threshold [simulated]'
      }
    });
    window.dispatchEvent(softAnomaly);
  };

  const clearHistory = () => {
    localStorage.removeItem('auth_verification_history');
    setHistory([]);
    setLatestStats({ ratio: 0, status: 'normal' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-200">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Cpu className="text-primary animate-pulse h-8 w-8" />
            Advanced Biometric Security Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Monitor your continuous typing dynamics and manage active security configurations.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={clearHistory}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors border border-slate-700"
          >
            Reset Metrics History
          </button>
        </div>
      </div>

      {/* Top Telemetry Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Profile Status */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center space-x-4">
          <div className="bg-teal-950/50 p-3.5 rounded-xl border border-primary/20">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Biometric Shield Status</p>
            <h4 className="text-lg font-extrabold text-white mt-0.5">Active & Trained</h4>
            <p className="text-[10px] text-primary/70 font-mono mt-0.5">Continuous Biometric Protection Enabled</p>
          </div>
        </div>

        {/* Security Sensitivity */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center space-x-4">
          <div className="bg-purple-950/40 p-3.5 rounded-xl border border-cyber-purple/20">
            <Sliders className="h-6 w-6 text-cyber-purple" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Sensitivity Threshold</p>
            <h4 className="text-lg font-extrabold text-white mt-0.5">{Math.round(threshold * 100)}% Anomaly</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Adjustable sensitivity</p>
          </div>
        </div>

        {/* Last Verification Score */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center space-x-4">
          <div className={`p-3.5 rounded-xl border ${
            latestStats.status === 'anomaly' 
              ? 'bg-red-950/40 border-red-500/20 text-red-400' 
              : latestStats.status === 'unusual'
              ? 'bg-amber-950/40 border-amber-500/20 text-amber-400'
              : 'bg-teal-950/50 border-cyber-green/20 text-cyber-green'
          }`}>
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Last Rhythm Deviation</p>
            <h4 className="text-lg font-extrabold text-white mt-0.5">
              {Math.round(latestStats.ratio * 100)}%
            </h4>
            <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5 font-mono">
              Status: <span className={
                latestStats.status === 'anomaly' 
                  ? 'text-red-400' 
                  : latestStats.status === 'unusual'
                  ? 'text-amber-400'
                  : 'text-cyber-green'
              }>{latestStats.status}</span>
            </p>
          </div>
        </div>

        {/* Active Session Watchdog */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center space-x-4">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/50">
            <Lock className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Auto-Lock Timer</p>
            <h4 className="text-lg font-extrabold text-white mt-0.5 font-mono">{inactivityCountdown}s</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Lockout if idle</p>
          </div>
        </div>

      </div>

      {/* Main Charts & Logs Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-time Graph of anomalies */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Continuous Biometric Monitoring History</h3>
            <p className="text-xs text-slate-400 mb-6">Monitors your typing rhythm variations in 5-second intervals to verify identity.</p>
          </div>
          
          <div className="h-64 w-full">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                <p className="text-sm text-slate-500 font-mono">NO TELEMETRY RETRIEVED YET</p>
                <p className="text-xs text-slate-600 mt-1">Move your mouse or type keys to capture behavior data.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis 
                    dataKey="timestamp" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    domain={[0, 1]}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <ChartTooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: '1px solid #1e293b',
                      color: '#f8fafc',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ratio" 
                    stroke="#00f2fe" 
                    strokeWidth={3}
                    dot={{ fill: '#00f2fe', stroke: '#0f172a', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Console Log Terminal */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col h-[380px]">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Biometric Telemetry Stream
          </h3>
          <p className="text-xs text-slate-400 mb-4">Real-time timing transitions captured by the secure keyboard dynamics sensor:</p>
          
          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar flex flex-col-reverse gap-1.5 text-slate-400">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-center uppercase tracking-wide">
                [Idle - Listening for interaction...]
              </div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`leading-relaxed border-l-2 pl-2 border-slate-800 ${
                    index === 0 ? 'text-primary border-primary font-bold' : ''
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* active defense controls & simulators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Sensitivity Control Card */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
          <div>
            <h4 className="text-base font-extrabold text-white">Biometric Shield Configuration</h4>
            <p className="text-xs text-slate-400 mt-1">Adjust the biometric rhythm deviation sensitivity required to auto-lock the session.</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-300">Security Shield Sensitivity</span>
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20 font-mono">
                {Math.round(threshold * 100)}%
              </span>
            </div>
            
            <input 
              type="range" 
              min="0.1" 
              max="0.9" 
              step="0.05"
              value={threshold}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary border border-slate-700" 
            />
            
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.1 (High Security)</span>
              <span>0.5 (Balanced)</span>
              <span>0.9 (Low Sensitivity)</span>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-white uppercase block mb-1">Security Logic:</span>
            Every 5 seconds, your typing timing vectors are verified against your baseline. If the timing deviation exceeds the sensitivity threshold, the session is locked to prevent unauthorized access.
          </div>
        </div>

        {/* Attack Simulator Card */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
          <div>
            <h4 className="text-base font-extrabold text-white">Security Threat Simulators</h4>
            <p className="text-xs text-slate-400 mt-1">Simulate common threat vectors to verify the effectiveness of the continuous protection system.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Simulate Fast Typing bot — CRITICAL: goes straight to /locked */}
            <button
              onClick={handleBotAttack}
              className="flex items-center justify-between p-4 rounded-xl bg-red-950/10 hover:bg-red-950/30 border border-red-500/25 transition-all text-left group"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-200 flex items-center gap-1.5">
                  <Keyboard size={14} className="text-red-400" />
                  Automated Script Simulator
                </span>
                <span className="text-[10px] text-slate-400 block">Instant lockout — no modal</span>
              </div>
              <Play size={14} className="text-red-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Intruder Simulation — SOFT: triggers Step-Up MFA modal */}
            <button
              onClick={handleIntruderSim}
              className="flex items-center justify-between p-4 rounded-xl bg-orange-950/10 hover:bg-orange-950/30 border border-orange-500/25 transition-all text-left group"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-orange-200 flex items-center gap-1.5">
                  <MousePointer size={14} className="text-orange-400" />
                  Unusual Typing Rhythm Simulator
                </span>
                <span className="text-[10px] text-slate-400 block">Triggers Step-Up MFA modal ✦</span>
              </div>
              <Play size={14} className="text-orange-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-white uppercase block mb-1">Instant Locktriggers:</span>
            Security note: Instant lockout features (like automated typing patterns or rapid screen captures) will lock the session immediately to protect sensitive banking data.
          </div>
        </div>

      </div>

    </div>
  );
};

export default SecurityHub;
