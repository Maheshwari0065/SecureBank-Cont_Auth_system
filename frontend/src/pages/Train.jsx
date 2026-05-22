import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import tracker from '../utils/tracker';
import { Fingerprint, CheckCircle, Sparkles, Activity, ShieldAlert, ChevronRight, Lock, Key, Cpu, HelpCircle } from 'lucide-react';

const Train = () => {
  const navigate = useNavigate();
  const [round, setRound] = useState(1);
  const [text, setText] = useState('');
  const [totalKeystrokes, setTotalKeystrokes] = useState(0); // cumulative across all rounds
  const [roundKeystrokes, setRoundKeystrokes] = useState(0); // vectors captured this round only
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [roundComplete, setRoundComplete] = useState(false); // shows round-complete flash

  const textareaRef = useRef(null);
  const baseKeystrokesRef = useRef(0);

  // Round 2 states
  const [passcode, setPasscode] = useState('');
  const [pressedKey, setPressedKey] = useState(null);

  // Round 3 states
  const r3Words = ["TRANSFER", "CREDENTIAL", "PROTECTION", "SECURITY", "CONFIRM"];
  const [r3Index, setR3Index] = useState(0);

  // Passcode generator for Round 2
  const generatePasscode = () => {
    const words = ["SHIELD", "VAULT", "MATRIX", "CYBER", "SECURE", "BIOMETRIC", "NEURAL", "DYNAMIC"];
    const word = words[Math.floor(Math.random() * words.length)];
    const num1 = Math.floor(1000 + Math.random() * 9000);
    const num2 = Math.floor(1000 + Math.random() * 9000);
    const specials = ["#", "$", "%", "&", "!", "@"];
    const spec = specials[Math.floor(Math.random() * specials.length)];
    return `${num1}-${word}-${num2}${spec}`;
  };

  // ── Setup tracker once ────────────────────────────────────────────────────
  useEffect(() => {
    tracker.clearEvents();
    tracker.start();
    baseKeystrokesRef.current = 0;

    const interval = setInterval(() => {
      const total = tracker.getEvents().length;
      setTotalKeystrokes(total);
      setRoundKeystrokes(Math.max(0, total - baseKeystrokesRef.current));
    }, 300);

    const handleTelemetry = (e) => {
      setTelemetryHistory(prev => {
        const updated = [...prev, {
          id: Math.random(),
          hold: Math.min(e.detail.hold_time, 500),
          flight: Math.min(e.detail.flight_time, 800),
          speed: e.detail.mouse_speed
        }];
        return updated.slice(-20);
      });
    };

    window.addEventListener('biometric_telemetry', handleTelemetry);

    if (textareaRef.current) textareaRef.current.focus();

    return () => {
      clearInterval(interval);
      window.removeEventListener('biometric_telemetry', handleTelemetry);
      tracker.stop();
    };
  }, []);

  // ── Physical key tracking for Round 2 virtual keypad ──────────────────────
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      let keyName = e.key.toUpperCase();
      if (e.key === 'Backspace') keyName = 'BACKSPACE';
      setPressedKey(keyName);
    };
    const handleGlobalKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, []);

  // ── Re-focus textarea when round changes ─────────────────────────────────
  useEffect(() => {
    if (round === 2) {
      setPasscode(generatePasscode());
    }
    setText('');
    if (textareaRef.current) textareaRef.current.focus();
  }, [round]);

  const handleContainerClick = () => {
    if (textareaRef.current) textareaRef.current.focus();
  };

  // Determine current active target text
  let targetText = "";
  if (round === 1) {
    targetText = "SecureBank protects my money with advanced AI biometrics.";
  } else if (round === 2) {
    targetText = passcode;
  } else {
    targetText = r3Words[r3Index] || "";
  }

  // Determine completion and typing state
  const isTypingDone = round === 3
    ? (r3Index === r3Words.length - 1 && text === targetText)
    : (text === targetText && text.length > 0);

  const isReadyToAdvance = round === 1
    ? (isTypingDone && roundKeystrokes >= 30)
    : round === 2
    ? (isTypingDone && roundKeystrokes >= 30)
    : (isTypingDone && totalKeystrokes >= 85);

  // ── Handle moving to next round / submitting ──────────────────────────────
  const handleNextRound = async () => {
    if (round < 3) {
      setRoundComplete(true);
      setTimeout(() => {
        setRoundComplete(false);
        // Snapshot current total so next round delta starts from 0
        baseKeystrokesRef.current = tracker.getEvents().length;
        setRoundKeystrokes(0);
        setRound(r => r + 1);
        setError('');
      }, 1400);
    } else {
      const events = tracker.getEvents();
      if (events.length < 80) {
        setError(`Need at least 80 keystroke vectors. Collected: ${events.length}. Keep typing a bit more.`);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await api.post('/api/train', { events });
        if (res.data.success) {
          const user = JSON.parse(localStorage.getItem('user'));
          user.is_trained = true;
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/dashboard');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Training failed. Please try again.');
        setLoading(false);
      }
    }
  };

  // Progression math
  const roundProgressPercent = round === 1
    ? Math.min((roundKeystrokes / 30) * 100, 100)
    : round === 2
    ? Math.min((roundKeystrokes / 30) * 100, 100)
    : Math.min((totalKeystrokes / 85) * 100, 100);

  const overallProgress = round === 1
    ? Math.min((roundKeystrokes / 30) * 33.3, 33.3)
    : round === 2
    ? 33.3 + Math.min((roundKeystrokes / 30) * 33.3, 33.3)
    : 66.6 + Math.min((roundKeystrokes / 25) * 33.4, 33.4);

  const targetChars = targetText.split('');

  // ── Round-complete overlay ────────────────────────────────────────────────
  if (roundComplete) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center font-sans">
        <div className="text-center animate-pulse">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-cyber-green/10 border-2 border-cyber-green mb-6 shadow-glow-green">
            <CheckCircle className="h-12 w-12 text-cyber-green" />
          </div>
          <p className="text-2xl font-extrabold text-cyber-green text-glow-green tracking-widest uppercase">
            Round {round} Complete!
          </p>
          <p className="mt-2 text-slate-400 font-mono text-sm">
            Calibrating security baseline… Loading Round {round + 1} of 3
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/10 via-cyber-dark to-cyber-dark pointer-events-none z-0"></div>

      <div className="max-w-6xl w-full glass-panel rounded-3xl shadow-glow-teal overflow-hidden border border-slate-800 z-10">
        <div className="p-8 md:p-12">

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="text-center mb-8 relative">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border border-primary/20 mb-4 shadow-glow-teal animate-pulse">
              <Fingerprint className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white text-glow-teal">
              Biometric Security Profile Calibration
            </h2>
            <p className="mt-3 text-sm text-slate-400 max-w-2xl mx-auto">
              Calibrate your unique typing rhythm baseline. SecureBank analyzes micro-second timing intervals in the background to establish your secure profile. Please type at your natural pace to build an accurate signature.
            </p>
          </div>

          {/* ── Round Pills ──────────────────────────────────────────── */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3].map(r => (
              <div
                key={r}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-300 ${
                  r < round
                    ? 'border-cyber-green/50 bg-cyber-green/10 text-cyber-green text-glow-green'
                    : r === round
                    ? 'border-primary/80 bg-primary/10 text-primary shadow-glow-teal'
                    : 'border-slate-800 bg-transparent text-slate-655'
                }`}
              >
                {r < round ? <CheckCircle className="h-3 w-3" /> : <span>0{r}</span>}
                Round {r}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-8 bg-red-950/40 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Round-Specific Instructions ── */}
          <div className="mb-6 p-4 rounded-xl bg-slate-900/30 border border-slate-850 text-center">
            {round === 1 && (
              <p className="text-xs font-mono text-slate-350">
                <Sparkles className="inline h-3.5 w-3.5 mr-1.5 text-primary" />
                <strong>Round 1 Calibration:</strong> Type the standard banking sentence below to calibrate your baseline timing rhythms.
              </p>
            )}
            {round === 2 && (
              <p className="text-xs font-mono text-slate-350">
                <Lock className="inline h-3.5 w-3.5 mr-1.5 text-cyber-purple" />
                <strong>Round 2 Calibration:</strong> Type the dynamic alphanumeric passcode. The virtual keys will highlight to map flight transitions!
              </p>
            )}
            {round === 3 && (
              <p className="text-xs font-mono text-slate-350">
                <Activity className="inline h-3.5 w-3.5 mr-1.5 text-red-450 animate-pulse" />
                <strong>Round 3 Calibration:</strong> Type the five secure authentication keywords as they appear to complete your pattern baseline!
              </p>
            )}
          </div>

          {/* ── Round 3 Keywords Progress List ── */}
          {round === 3 && (
            <div className="flex justify-center gap-3 mb-6 font-mono text-xs">
              {r3Words.map((w, idx) => (
                <span
                  key={w}
                  className={`px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                    idx < r3Index
                      ? 'border-cyber-green/40 bg-cyber-green/5 text-cyber-green line-through'
                      : idx === r3Index
                      ? 'border-red-500/80 bg-red-950/20 text-red-450 font-extrabold shadow-glow-red'
                      : 'border-slate-800 text-slate-600 bg-slate-950/20'
                  }`}
                >
                  {w}
                </span>
              ))}
            </div>
          )}

          {/* ── Immersive Workspace Layout ───────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">

            {/* Immersive Typing Pad (Col-span 8 of 12 for high resolution) */}
            <div className="lg:col-span-8 space-y-4">
              <div
                onClick={handleContainerClick}
                className="relative min-h-[220px] p-8 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-text select-none focus-within:border-primary/40 focus-within:shadow-glow-teal/5 transition-all duration-300"
              >
                {/* Floating focus indicator */}
                <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-md px-2 py-0.5 text-[9px] font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse"></span>
                  KEYBOARD CAPTURE ENGAGED
                </div>

                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (round === 3) {
                      const upperVal = val.toUpperCase();
                      if (upperVal.length <= targetText.length) {
                        setText(upperVal);
                        if (upperVal === targetText) {
                          if (r3Index < r3Words.length - 1) {
                            setTimeout(() => {
                              setR3Index(prev => prev + 1);
                              setText('');
                            }, 200);
                          }
                        }
                      }
                    } else {
                      if (val.length <= targetText.length) {
                        setText(val);
                      }
                    }
                  }}
                  disabled={loading || roundComplete}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none focus:outline-none"
                  placeholder="Click here to type..."
                />
                
                {/* Immersive font and wide line-height */}
                <div className="font-mono text-xl md:text-2xl leading-relaxed tracking-wide select-none text-slate-650 whitespace-pre-wrap pt-4">
                  {targetChars.map((char, idx) => {
                    let charClass = "";
                    if (idx < text.length) {
                      charClass = text[idx] === char ? "char-correct font-extrabold" : "char-incorrect font-bold";
                    } else if (idx === text.length) {
                      charClass = "char-current";
                    }
                    return <span key={idx} className={charClass}>{char}</span>;
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <HelpCircle size={13} className="text-primary animate-pulse" /> 
                  {round === 3 
                    ? `MITIGATION TARGET: Type the active phrase above in ALL CAPS.` 
                    : `Keep typing naturally. Do not rush to ensure organic rhythm.`}
                </span>
                <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-450">
                  {text.length} / {targetText.length} Chars
                </span>
              </div>
            </div>

            {/* High-Fidelity Biometric Live Dashboard or Keypad (Col-span 4) */}
            <div className="lg:col-span-4 rounded-2xl bg-slate-900/50 border border-slate-800 p-6 flex flex-col justify-between shadow-inner min-h-[280px]">
              
              {/* ROUND 2: Interactive Security Keypad */}
              {round === 2 ? (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center font-mono">
                        <Lock className="h-4 w-4 mr-2 text-cyber-purple" />
                        Dynamic Timing Map
                      </h3>
                      <span className="text-[9px] font-mono text-cyber-purple border border-cyber-purple/20 bg-cyber-purple/5 px-2 py-0.5 rounded">
                        KEYBOARD MAP
                      </span>
                    </div>

                    {/* Numeric Keypad Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', 'BACKSPACE'].map((k) => {
                        const isPressed = pressedKey === k || (k === 'BACKSPACE' && pressedKey === 'BACKSPACE');
                        return (
                          <div
                            key={k}
                            className={`flex items-center justify-center p-3 rounded-xl border text-sm font-bold font-mono transition-all duration-100 uppercase ${
                              k === 'BACKSPACE' ? 'text-[10px] leading-none' : ''
                            } ${
                              isPressed
                                ? 'bg-primary/20 border-primary text-primary shadow-glow-teal scale-95 font-extrabold'
                                : 'bg-slate-950/60 border-slate-850 text-slate-500'
                            }`}
                          >
                            {k}
                          </div>
                        );
                      })}
                    </div>

                    {/* Special characters row */}
                    <div className="grid grid-cols-6 gap-1.5 mt-3">
                      {['#', '$', '%', '&', '!', '@'].map((k) => {
                        const isPressed = pressedKey === k;
                        return (
                          <div
                            key={k}
                            className={`flex items-center justify-center p-2.5 rounded-lg border text-xs font-bold font-mono transition-all duration-100 ${
                              isPressed
                                ? 'bg-cyber-purple/25 border-cyber-purple text-cyber-purple shadow-glow-purple scale-95'
                                : 'bg-slate-950/60 border-slate-850 text-slate-500'
                            }`}
                          >
                            {k}
                          </div>
                        );
                      })}
                    </div>

                    {/* Dynamic Alpha Captures Strip */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-950/40 border border-slate-850 flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 shrink-0">Passphrase Alpha</span>
                      <div className="flex gap-1 overflow-x-auto pl-2 py-0.5">
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((l) => {
                          const isPressed = pressedKey === l;
                          const isUsedInPasscode = passcode.toUpperCase().includes(l);
                          if (!isUsedInPasscode) return null;
                          return (
                            <div
                              key={l}
                              className={`w-6 h-6 shrink-0 flex items-center justify-center rounded text-[11px] font-bold font-mono transition-all duration-100 ${
                                isPressed
                                  ? 'bg-cyber-green/20 border border-cyber-green text-cyber-green shadow-glow-green scale-95 font-extrabold'
                                  : 'bg-slate-900/60 border border-slate-800 text-slate-600'
                              }`}
                            >
                              {l}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-[9px] font-mono text-slate-500 text-center border-t border-slate-800/80 pt-3">
                    Analyzes key-to-key transition flight times and physical key hold durations.
                  </div>
                </div>
              ) : (
                /* ROUND 1 & 3: High-Fidelity Biometric Waveforms (toned down slightly for clean look) */
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center font-mono">
                        <Activity className="h-4 w-4 mr-2 text-primary animate-pulse" />
                        Biometric Waveforms
                      </h3>
                      <span className="text-[9px] font-mono text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">
                        REAL-TIME
                      </span>
                    </div>
                    
                    <div className="h-[170px] flex items-end justify-between gap-1 border-b border-slate-850 pb-2 relative">
                      {telemetryHistory.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                          <Cpu className="h-8 w-8 text-slate-700 animate-spin mb-2" />
                          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">WAITING FOR TYPING INPUT...</p>
                        </div>
                      ) : (
                        telemetryHistory.map((item) => (
                          <div key={item.id} className="flex-1 flex flex-col items-center justify-end h-full">
                            <div
                              style={{ height: `${(item.flight / 800) * 100}%` }}
                              className="w-full bg-gradient-to-t from-cyber-purple/20 to-cyber-purple rounded-t-sm transition-all duration-300 shadow-glow-purple"
                              title={`Flight: ${Math.round(item.flight)}ms`}
                            ></div>
                            <div
                              style={{ height: `${(item.hold / 500) * 100}%` }}
                              className="w-full mt-0.5 bg-gradient-to-t from-primary/20 to-primary rounded-t-sm transition-all duration-300 shadow-glow-teal"
                              title={`Hold: ${Math.round(item.hold)}ms`}
                            ></div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2 pt-3 border-t border-slate-800/80 text-[9px] text-slate-500 font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-sm bg-primary mr-1.5 shadow-glow-teal"></div>
                        <span>Hold Time (Down Time)</span>
                      </div>
                      <span>MAX: 500ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-sm bg-cyber-purple mr-1.5 shadow-glow-purple"></div>
                        <span>Flight Time (Transition)</span>
                      </div>
                      <span>MAX: 800ms</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Progress Indicators ── */}
          <div className="mb-10 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-6">
            
            {/* Overall Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
                <span className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-cyber-purple" />
                  Overall Security Calibration Progress
                </span>
                <span className="text-cyber-purple font-bold text-glow-purple text-sm">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-850 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-cyber-purple to-cyber-green transition-all duration-500 shadow-glow-purple"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Round Objective */}
            <div className="pt-4 border-t border-slate-800/60">
              <div className="flex flex-col sm:flex-row justify-between text-sm font-semibold text-slate-350 mb-2.5 gap-2">
                <span className="flex items-center font-mono text-xs uppercase tracking-widest text-slate-450">
                  <Lock className="h-4 w-4 mr-2 text-primary" />
                  {round === 1 && `Round 1 Baseline Calibration (need 30+ timing samples)`}
                  {round === 2 && `Round 2 Secure PIN Calibration (need 30+ timing samples)`}
                  {round === 3 && `Round 3 Profile Consolidation (need 25+ samples this round & 85+ total)`}
                </span>
                <span className={`font-mono text-xs font-bold ${isReadyToAdvance ? 'text-cyber-green text-glow-green' : 'text-cyber-amber'}`}>
                  {round === 3 ? `${totalKeystrokes} / 85 samples` : `${roundKeystrokes} / 30`}
                  &nbsp;({Math.round(roundProgressPercent)}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-850">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isReadyToAdvance
                      ? 'bg-cyber-green shadow-glow-green'
                      : 'bg-primary animate-pulse shadow-glow-teal'
                  }`}
                  style={{ width: `${roundProgressPercent}%` }}
                ></div>
              </div>
              <p className={`mt-2 text-[10px] font-mono ${isReadyToAdvance ? 'text-cyber-green font-bold' : 'text-slate-500'}`}>
                {isReadyToAdvance
                  ? `✔ ${round === 3 ? 'Consolidated biometric signature locked in! Click Activate below.' : 'Target timing baseline captured successfully. Advance unlocked!'}`
                  : `⏳ Calibration: ${!isTypingDone ? 'Type the exact target prompt to match' : 'Analyzing typing dynamics baseline'}...`}
              </p>
            </div>
          </div>

          {/* ── Footer / Actions ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-8 gap-4">
            <p className="text-[11px] text-slate-500 font-mono flex items-center text-center sm:text-left">
              <Key className="h-4 w-4 mr-2 text-cyber-green shrink-0 shadow-glow-green" />
              Biometric dynamics are encrypted and securely processed to build your baseline authentication profile.
            </p>
            
            <button
              onClick={handleNextRound}
              disabled={loading || !isReadyToAdvance}
              className="w-full sm:w-auto inline-flex items-center justify-center py-4 px-10 border border-transparent text-xs font-extrabold tracking-widest uppercase rounded-xl text-slate-950 bg-primary hover:bg-white focus:outline-none disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 shadow-glow-teal hover:shadow-white/20 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Calibrating Signature…</span>
                </div>
              ) : round < 3 ? (
                <span className="flex items-center gap-2">Advance Round <ChevronRight className="h-4 w-4" /></span>
              ) : (
                'Activate Biometric Protection'
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Train;
