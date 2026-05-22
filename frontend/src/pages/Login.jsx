import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/login', formData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        
        if (!res.data.is_trained) {
          navigate('/train');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/15 via-cyber-dark to-cyber-dark pointer-events-none z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="flex justify-center">
          <div className="p-3 bg-teal-950/40 border border-primary/30 rounded-2xl shadow-glow-teal animate-pulse">
            <ShieldCheck size={36} className="text-primary" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-4xl font-black text-white tracking-widest text-glow-teal">
          SECUREBANK
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Secure Online Banking Access Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl border border-slate-800/80 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-200 text-xs p-3 bg-red-950/40 border border-red-500/35 rounded-xl">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Username</label>
              <input 
                name="username" 
                type="text" 
                required 
                onChange={handleChange} 
                className="appearance-none block w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl shadow-inner text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm" 
                placeholder="developer_secure"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                onChange={handleChange} 
                className="appearance-none block w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl shadow-inner text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm" 
                placeholder="••••••••"
              />
            </div>

            <div>
              <button 
                type="submit" 
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-slate-950 bg-primary hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-glow-teal hover:shadow-white/10"
              >
                Secure Log In
              </button>
            </div>

            <div className="text-center">
              <Link to="/register" className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors">
                Open a new secure account &rarr;
              </Link>
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center justify-center text-[10px] text-slate-500 border-t border-slate-850 pt-5 space-y-1">
             <div className="flex items-center space-x-1.5">
                <Lock size={12} className="text-cyber-green animate-pulse" />
                <span className="font-bold uppercase tracking-wider text-slate-400">Continuous Biometric Shield Active</span>
             </div>
             <span>Your typing rhythm dynamics are actively verified for secure access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
