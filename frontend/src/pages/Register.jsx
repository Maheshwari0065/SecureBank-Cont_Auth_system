import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  
  const calculateStrength = (pass) => {
    let strength = 0;
    if (pass.length > 5) strength += 1;
    if (pass.length > 7) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const strength = calculateStrength(formData.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Highly Secure'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-primary-dark', 'bg-cyber-green'];

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      return setError('Passwords do not match');
    }
    
    try {
      const res = await api.post('/api/register', {
        full_name: formData.username,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      if (res.data.success) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          Open a new secure account with active biometric timing protection
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl border border-slate-800/80 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-200 text-xs p-3 bg-red-950/40 border border-red-500/35 rounded-xl">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">Username</label>
              <input 
                name="username" 
                type="text" 
                required 
                onChange={handleChange} 
                className="appearance-none block w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-inner text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-xs" 
                placeholder="user_secure"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                onChange={handleChange} 
                className="appearance-none block w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-inner text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-xs" 
                placeholder="user@securebank.com"
              />
            </div>

            <div>
               <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">Password</label>
               <input 
                 name="password" 
                 type="password" 
                 required 
                 onChange={handleChange} 
                 className="appearance-none block w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-inner text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-xs" 
                 placeholder="••••••••"
               />
               {formData.password && (
                 <div className="mt-2.5">
                   <div className="w-full bg-slate-850 rounded-full h-1.5 mb-1 border border-slate-800">
                     <div className={`h-1.5 rounded-full transition-all duration-500 ${strengthColors[Math.min(strength, 4)]}`} style={{ width: `${(Math.min(strength, 4) + 1) * 20}%` }}></div>
                   </div>
                   <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 text-right">{strengthLabels[Math.min(strength, 4)]}</p>
                 </div>
               )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">Confirm Password</label>
              <input 
                name="confirm_password" 
                type="password" 
                required 
                onChange={handleChange} 
                className="appearance-none block w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-inner text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-xs" 
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-slate-950 bg-primary hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-glow-teal hover:shadow-white/10"
              >
                Create Account & Calibrate Security
              </button>
            </div>
            
            <div className="text-center">
              <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors">
                Already have a secure account? Log in &rarr;
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
