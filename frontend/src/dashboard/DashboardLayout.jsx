import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Send, 
  History, 
  CreditCard, 
  Settings, 
  LogOut, 
  ShieldCheck,
  User as UserIcon,
  Activity,
  Fingerprint,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Timer,
  Scan,
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import tracker from '../utils/tracker';
import StatusBadge from '../components/StatusBadge';

// ─────────────────────────────────────────────────────────────
// Step-Up MFA Modal Component
// ─────────────────────────────────────────────────────────────
const StepUpModal = ({ anomalyMessage, onSuccess, onFailure }) => {
  const [mode, setMode] = useState('touchid'); // 'touchid' | 'otp'
  const [scanProgress, setScanProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [otpCode] = useState(() => {
    const n = Math.floor(100000 + Math.random() * 900000).toString();
    return n.slice(0, 3) + ' ' + n.slice(3);
  });
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [phase, setPhase] = useState('challenge'); // 'challenge' | 'success' | 'fail'
  const [attempts, setAttempts] = useState(0);

  const holdIntervalRef = useRef(null);
  const countdownRef = useRef(null);
  const scanBarRef = useRef(null);
  const [scanBarPos, setScanBarPos] = useState(0);
  const [scanBarDir, setScanBarDir] = useState(1);

  // Animated scan bar
  useEffect(() => {
    scanBarRef.current = setInterval(() => {
      setScanBarPos(p => {
        const next = p + scanBarDir * 2;
        if (next >= 100) { setScanBarDir(-1); return 100; }
        if (next <= 0)   { setScanBarDir(1);  return 0;  }
        return next;
      });
    }, 20);
    return () => clearInterval(scanBarRef.current);
  }, [scanBarDir]);

  // OTP countdown
  useEffect(() => {
    if (mode !== 'otp' || phase !== 'challenge') return;
    setCountdown(15);
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          setPhase('fail');
          setTimeout(onFailure, 1800);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [mode, phase]);

  // Holding touch ID scanner
  const startHold = useCallback(() => {
    if (scanComplete || phase !== 'challenge') return;
    setIsHolding(true);
    holdIntervalRef.current = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(holdIntervalRef.current);
          setScanComplete(true);
          setIsHolding(false);
          setPhase('success');
          setTimeout(onSuccess, 1800);
          return 100;
        }
        return p + 1.8;
      });
    }, 25);
  }, [scanComplete, phase, onSuccess]);

  const stopHold = useCallback(() => {
    if (scanComplete) return;
    setIsHolding(false);
    clearInterval(holdIntervalRef.current);
    setScanProgress(0);
  }, [scanComplete]);

  // OTP submit
  const handleOtpSubmit = () => {
    const clean = otpInput.replace(/\s/g, '');
    const target = otpCode.replace(/\s/g, '');
    if (clean === target) {
      clearInterval(countdownRef.current);
      setPhase('success');
      setTimeout(onSuccess, 1800);
    } else {
      setOtpError(true);
      setAttempts(a => {
        const next = a + 1;
        if (next >= 3) {
          clearInterval(countdownRef.current);
          setPhase('fail');
          setTimeout(onFailure, 1800);
        }
        return next;
      });
      setTimeout(() => setOtpError(false), 800);
      setOtpInput('');
    }
  };

  const circumference = 2 * Math.PI * 44;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{backdropFilter:'blur(16px)', background:'rgba(2,8,20,0.92)'}}>
      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{background:'radial-gradient(circle, #00f5d4, transparent)'}} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl" style={{background:'radial-gradient(circle, #a855f7, transparent)'}} />
      </div>

      <div className="relative w-full max-w-lg mx-4">
        {/* Card */}
        <div className="rounded-3xl border overflow-hidden shadow-2xl" 
          style={{
            background:'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(2,8,20,0.98) 100%)',
            borderColor: phase === 'success' ? 'rgba(0,245,212,0.4)' : phase === 'fail' ? 'rgba(239,68,68,0.4)' : 'rgba(0,245,212,0.2)',
            boxShadow: phase === 'success' ? '0 0 60px rgba(0,245,212,0.2)' : phase === 'fail' ? '0 0 60px rgba(239,68,68,0.2)' : '0 0 40px rgba(0,245,212,0.1)'
          }}
        >
          {/* Top header bar */}
          <div className="px-8 py-4 border-b flex items-center justify-between" style={{borderColor:'rgba(51,65,85,0.6)', background:'rgba(2,8,20,0.6)'}}>
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={16} className="text-amber-400" style={{filter:'drop-shadow(0 0 6px #f59e0b)'}} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Advanced Biometric Security Challenge</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{boxShadow:'0 0 6px #f59e0b'}} />
              <span className="text-[9px] font-mono text-amber-400">SECURITY HOLD</span>
            </div>
          </div>

          <div className="p-8">
            {/* ── PHASE: challenge ─────────────────────────────────── */}
            {phase === 'challenge' && (
              <>
                {/* Anomaly alert */}
                <div className="mb-6 rounded-xl px-4 py-3 border flex items-start gap-3" 
                  style={{background:'rgba(245,158,11,0.06)', borderColor:'rgba(245,158,11,0.25)'}}>
                  <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 mb-0.5">Unusual Typing Rhythm Detected</p>
                    <p className="text-[11px] text-slate-400 font-mono">{anomalyMessage || 'Your typing timing pattern deviates significantly from your established baseline profile.'}</p>
                  </div>
                </div>

                {/* Mode tabs */}
                <div className="flex gap-2 mb-8 p-1 rounded-xl" style={{background:'rgba(15,23,42,0.8)', border:'1px solid rgba(51,65,85,0.5)'}}>
                  {[
                    { id: 'touchid', icon: <Fingerprint size={13} />, label: 'Biometric Touch Scan' },
                    { id: 'otp',     icon: <KeyRound size={13} />,    label: 'Operator OTP' }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => { setMode(tab.id); setScanProgress(0); setIsHolding(false); setOtpInput(''); setOtpError(false); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300"
                      style={mode === tab.id
                        ? {background:'rgba(0,245,212,0.12)', color:'#00f5d4', border:'1px solid rgba(0,245,212,0.3)', boxShadow:'0 0 16px rgba(0,245,212,0.1)'}
                        : {color:'rgba(148,163,184,0.6)', border:'1px solid transparent'}
                      }>
                      {tab.icon}{tab.label}
                    </button>
                  ))}
                </div>

                {/* ── TOUCH ID MODE ── */}
                {mode === 'touchid' && (
                  <div className="flex flex-col items-center">
                    <p className="text-xs text-slate-500 mb-8 text-center font-mono">
                      Press and hold the scanner below until biometric rhythm sync reaches <span style={{color:'#00f5d4'}}>100%</span>
                    </p>

                    {/* Scanner container */}
                    <div className="relative flex items-center justify-center mb-6">
                      {/* Outer rotating ring */}
                      <div className="absolute w-40 h-40 rounded-full border-2 border-dashed animate-spin" 
                        style={{borderColor:'rgba(0,245,212,0.15)', animationDuration:'8s'}} />
                      
                      {/* Progress SVG circle */}
                      <svg className="absolute w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,245,212,0.08)" strokeWidth="3" />
                        <circle cx="50" cy="50" r="44" fill="none" stroke="#00f5d4" strokeWidth="3"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - (scanProgress / 100) * circumference}
                          strokeLinecap="round"
                          style={{transition:'stroke-dashoffset 0.1s linear', filter:'drop-shadow(0 0 6px #00f5d4)'}}
                        />
                      </svg>

                      {/* Central fingerprint button */}
                      <button
                        onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold}
                        onTouchStart={startHold} onTouchEnd={stopHold}
                        className="relative w-24 h-24 rounded-full flex flex-col items-center justify-center select-none transition-all duration-200 active:scale-95 cursor-pointer"
                        style={{
                          background: isHolding 
                            ? 'radial-gradient(circle, rgba(0,245,212,0.2) 0%, rgba(0,245,212,0.05) 100%)' 
                            : 'radial-gradient(circle, rgba(15,23,42,0.9) 0%, rgba(2,8,20,0.9) 100%)',
                          border: `2px solid ${isHolding ? 'rgba(0,245,212,0.6)' : 'rgba(0,245,212,0.2)'}`,
                          boxShadow: isHolding ? '0 0 30px rgba(0,245,212,0.3), inset 0 0 20px rgba(0,245,212,0.1)' : '0 0 10px rgba(0,245,212,0.1)'
                        }}
                      >
                        {/* Scanning laser bar */}
                        {isHolding && (
                          <div className="absolute inset-3 overflow-hidden rounded-full pointer-events-none">
                            <div className="absolute left-0 right-0 h-px opacity-80" 
                              style={{
                                top:`${scanBarPos}%`, 
                                background:'linear-gradient(90deg, transparent, #00f5d4, transparent)',
                                boxShadow:'0 0 8px #00f5d4, 0 0 16px rgba(0,245,212,0.5)'
                              }} 
                            />
                          </div>
                        )}
                        <Fingerprint size={30} style={{color: isHolding ? '#00f5d4' : 'rgba(0,245,212,0.5)', filter: isHolding ? 'drop-shadow(0 0 8px #00f5d4)' : 'none', transition:'all 0.2s'}} />
                        <span className="text-[8px] font-black uppercase tracking-widest mt-1" style={{color:'rgba(0,245,212,0.5)'}}>
                          {isHolding ? 'SYNCHRONIZING' : 'HOLD TO VERIFY'}
                        </span>
                      </button>
                    </div>

                    {/* Progress readout */}
                    <div className="w-full rounded-xl p-4 text-center" style={{background:'rgba(2,8,20,0.6)', border:'1px solid rgba(51,65,85,0.4)'}}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Rhythm Matching Progress</span>
                        <span className="text-xs font-black font-mono" style={{color:'#00f5d4'}}>{Math.round(scanProgress)}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'rgba(51,65,85,0.4)'}}>
                        <div className="h-full rounded-full transition-all duration-100" 
                          style={{width:`${scanProgress}%`, background:'linear-gradient(90deg, #00f5d4, #a855f7)', boxShadow:'0 0 8px rgba(0,245,212,0.6)'}} />
                      </div>
                      <p className="mt-2 text-[10px] text-slate-600 font-mono">
                        {isHolding ? '▶ Analyzing keystroke timing rhythms...' : 'Press and hold the biometric pad'}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── OTP MODE ── */}
                {mode === 'otp' && (
                  <div className="flex flex-col items-center">
                    <p className="text-xs text-slate-500 mb-6 text-center font-mono">
                      Type the operator sync code below before the timer expires
                    </p>

                    {/* OTP display + countdown ring */}
                    <div className="relative flex items-center justify-center mb-8">
                      <svg className="absolute w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="3" />
                        <circle cx="50" cy="50" r="44" fill="none" stroke="#a855f7" strokeWidth="3"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - (countdown / 15) * circumference}
                          strokeLinecap="round"
                          style={{transition:'stroke-dashoffset 1s linear', filter:'drop-shadow(0 0 6px #a855f7)'}}
                        />
                      </svg>
                      <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
                        style={{background:'radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(2,8,20,0.9) 100%)', border:'2px solid rgba(168,85,247,0.3)'}}>
                        <Timer size={16} style={{color:'#a855f7', marginBottom:4}} />
                        <span className="text-2xl font-black font-mono" style={{color: countdown <= 5 ? '#ef4444' : '#a855f7', filter:`drop-shadow(0 0 8px ${countdown <= 5 ? '#ef4444' : '#a855f7'})`}}>{countdown}</span>
                        <span className="text-[8px] text-slate-500 font-mono">SEC</span>
                      </div>
                    </div>

                    {/* OTP code display */}
                    <div className="mb-6 px-8 py-4 rounded-2xl text-center" style={{background:'rgba(168,85,247,0.06)', border:'1px solid rgba(168,85,247,0.2)'}}>
                      <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-2">Operator Sync Code</p>
                      <p className="text-4xl font-black font-mono tracking-[0.3em]" style={{color:'#a855f7', textShadow:'0 0 20px rgba(168,85,247,0.5)'}}>
                        {otpCode}
                      </p>
                    </div>

                    {/* Input */}
                    <div className="w-full space-y-3">
                      <input
                        type="text"
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value.replace(/[^0-9 ]/g, '').slice(0, 7))}
                        onKeyDown={e => e.key === 'Enter' && handleOtpSubmit()}
                        placeholder="_ _ _ _ _ _"
                        maxLength={7}
                        className="w-full text-center text-2xl font-black font-mono tracking-[0.4em] py-4 px-6 rounded-xl outline-none transition-all duration-300"
                        style={{
                          background:'rgba(2,8,20,0.8)',
                          border:`2px solid ${otpError ? 'rgba(239,68,68,0.6)' : 'rgba(168,85,247,0.3)'}`,
                          color: otpError ? '#ef4444' : '#e2e8f0',
                          boxShadow: otpError ? '0 0 20px rgba(239,68,68,0.2)' : '0 0 10px rgba(168,85,247,0.1)',
                          letterSpacing: '0.4em'
                        }}
                        autoFocus
                      />
                      {otpError && (
                        <p className="text-center text-[11px] text-red-400 font-mono animate-pulse">
                          ✗ Code mismatch — {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining
                        </p>
                      )}
                      <button onClick={handleOtpSubmit}
                        className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95"
                        style={{background:'linear-gradient(135deg, rgba(168,85,247,0.8), rgba(168,85,247,0.5))', color:'white', border:'1px solid rgba(168,85,247,0.4)', boxShadow:'0 0 20px rgba(168,85,247,0.2)'}}>
                        Verify Identity
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-5 border-t flex items-center justify-between" style={{borderColor:'rgba(51,65,85,0.4)'}}>
                  <p className="text-[9px] text-slate-600 font-mono">Continuous Authentication Engine v2</p>
                  <button onClick={() => { setPhase('fail'); setTimeout(onFailure, 500); }}
                    className="text-[10px] text-slate-600 hover:text-red-400 font-mono transition-colors underline underline-offset-2">
                    Abandon Session →
                  </button>
                </div>
              </>
            )}

            {/* ── PHASE: success ──────────────────────────────────── */}
            {phase === 'success' && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-pulse"
                  style={{background:'rgba(0,245,212,0.1)', border:'2px solid rgba(0,245,212,0.4)', boxShadow:'0 0 40px rgba(0,245,212,0.3)'}}>
                  <CheckCircle2 size={44} style={{color:'#00f5d4', filter:'drop-shadow(0 0 10px #00f5d4)'}} />
                </div>
                <h3 className="text-2xl font-black tracking-wider mb-2" style={{color:'#00f5d4', textShadow:'0 0 20px rgba(0,245,212,0.5)'}}>
                  IDENTITY VERIFIED
                </h3>
                <p className="text-sm text-slate-400 font-mono mb-4">Rhythm pattern verified. Resuming secure banking session.</p>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{background:'rgba(0,245,212,0.08)', border:'1px solid rgba(0,245,212,0.2)'}}>
                  <Scan size={13} style={{color:'#00f5d4'}} />
                  <span className="text-[10px] font-mono text-slate-400">Adjusting biometric profile to current typing dynamics…</span>
                </div>
              </div>
            )}

            {/* ── PHASE: fail ─────────────────────────────────────── */}
            {phase === 'fail' && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-pulse"
                  style={{background:'rgba(239,68,68,0.1)', border:'2px solid rgba(239,68,68,0.4)', boxShadow:'0 0 40px rgba(239,68,68,0.3)'}}>
                  <XCircle size={44} style={{color:'#ef4444', filter:'drop-shadow(0 0 10px #ef4444)'}} />
                </div>
                <h3 className="text-2xl font-black tracking-wider mb-2" style={{color:'#ef4444', textShadow:'0 0 20px rgba(239,68,68,0.5)'}}>
                  VERIFICATION FAILED
                </h3>
                <p className="text-sm text-slate-400 font-mono">Challenge expired or failed. Terminating session.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DashboardLayout
// ─────────────────────────────────────────────────────────────
const DashboardLayout = () => {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [authStatus, setAuthStatus] = useState({ status: 'normal', anomaly_ratio: 0 });
  const [showStepUp, setShowStepUp] = useState(false);
  const [stepUpMessage, setStepUpMessage] = useState('');
  const stepUpLock = useRef(false); // prevent double-trigger
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const CRITICAL_TRIGGERS = [
    'inactivity',
    'screenshot',
    'step-up authentication failed',
    'automated/fast typing'
  ];

  useEffect(() => {
    tracker.start();

    const handleAuthUpdate = (e) => {
      setAuthStatus(e.detail);

      if (e.detail.status === 'anomaly') {
        const msg = (e.detail.message || '').toLowerCase();
        const isCritical = CRITICAL_TRIGGERS.some(t => msg.includes(t));
        const isSimulated = msg.includes('simulated');

        if (isCritical) {
          // Handled globally by GlobalSecurityListener in App.jsx
          return;
        }

        if (isSimulated) {
          if (!stepUpLock.current) {
            stepUpLock.current = true;
            setStepUpMessage(e.detail.message || 'Typing pattern deviation detected.');
            setShowStepUp(true);
          }
        } else {
          // Real background typing anomaly -> lock session directly!
          console.warn("Real behavioral anomaly detected! Locking session directly.");
          localStorage.setItem('auth_lock_reason', e.detail.message || 'Session locked due to unusual behavior');
          navigate('/locked');
        }
      }
    };

    window.addEventListener('auth_status', handleAuthUpdate);
    return () => {
      window.removeEventListener('auth_status', handleAuthUpdate);
      tracker.stop();
    };
  }, [navigate]);

  const handleStepUpSuccess = () => {
    setShowStepUp(false);
    stepUpLock.current = false;
    // Reset tracker activity so inactivity timer restarts clean
    tracker.updateActivity();
    tracker.clearEvents();
    setAuthStatus({ status: 'normal', anomaly_ratio: 0 });
  };

  const handleStepUpFailure = () => {
    setShowStepUp(false);
    stepUpLock.current = false;
    localStorage.setItem('auth_lock_reason', 'Step-up authentication failed');
    tracker.triggerLock('Step-up authentication failed');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard',           path: '/dashboard',           icon: <LayoutDashboard size={20} /> },
    { name: 'Accounts',            path: '/dashboard/accounts',  icon: <Wallet size={20} /> },
    { name: 'Transfer Money',      path: '/dashboard/transfer',  icon: <Send size={20} /> },
    { name: 'Transaction History', path: '/dashboard/history',   icon: <History size={20} /> },
    { name: 'Cards',               path: '/dashboard/cards',     icon: <CreditCard size={20} /> },
    { name: 'AI Security Hub',     path: '/dashboard/security',  icon: <Activity size={20} /> },
    { name: 'Settings',            path: '/dashboard/settings',  icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-cyber-dark text-slate-100 overflow-hidden font-sans relative">
      {/* Step-Up MFA Modal */}
      {showStepUp && (
        <StepUpModal
          anomalyMessage={stepUpMessage}
          onSuccess={handleStepUpSuccess}
          onFailure={handleStepUpFailure}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center animate-fade-in" style={{backdropFilter:'blur(8px)', background:'rgba(2,8,20,0.85)'}}>
          <div className="relative w-full max-w-sm mx-4">
            <div className="rounded-2xl border p-6 overflow-hidden shadow-2xl space-y-5"
              style={{
                background:'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(2,8,20,0.98) 100%)',
                borderColor: 'rgba(239,68,68,0.3)',
                boxShadow: '0 0 40px rgba(239,68,68,0.1)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30">
                  <LogOut size={20} className="text-red-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-white">Confirm Logout</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Termination of secure session</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Are you sure you want to log out of your secure banking session? Your continuous biometric protection will be temporarily deactivated until your next login.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 transition-all border border-red-600/30 shadow-glow-red"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-teal-950/15 via-cyber-dark to-cyber-dark pointer-events-none z-0" />

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col shadow-xl z-10 transition-all duration-300">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-850">
          <div className="p-1.5 bg-teal-950/50 border border-primary/30 rounded-lg shadow-glow-teal animate-pulse">
            <ShieldCheck size={28} className="text-primary" />
          </div>
          <h1 className="text-xl font-black tracking-widest text-white text-glow-teal">SECUREBANK</h1>
        </div>

        <div className="p-6 border-b border-slate-850">
          <div className="flex items-center space-x-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
              <UserIcon size={18} className="text-slate-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate leading-tight">{user.full_name}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{user.account_number}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-slate-800/80 text-primary border-l-4 border-primary shadow-glow-teal'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                }`
              }
            >
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-sm font-semibold">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-850 bg-slate-950/80">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-950/15 rounded-xl transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Logout</span>
          </button>

          <div className="mt-4 flex items-center space-x-2.5 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-cyber-green animate-pulse shadow-[0_0_8px_#00f5d4]" />
            <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">Continuous Biometric Shield Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-0">
        <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-8 shadow-md z-10 relative">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              {window.location.pathname.split('/').pop() || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            {/* Step-Up MFA indicator pill */}
            {showStepUp && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg animate-pulse"
                style={{background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)'}}>
                <ShieldAlert size={13} className="text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Step-Up Active</span>
              </div>
            )}

            <StatusBadge status={authStatus.status} ratio={authStatus.anomaly_ratio} />

            <div className="h-8 w-px bg-slate-800" />

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-500">Session Audit Time</p>
                <p className="text-xs font-mono font-medium text-slate-300">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
              <div className="h-2 w-2 rounded-full bg-primary shadow-glow-teal animate-pulse" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
