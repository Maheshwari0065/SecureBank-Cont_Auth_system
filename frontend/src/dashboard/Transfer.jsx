import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Search, User, Plus, ShieldAlert, Wallet, ChevronRight, X } from 'lucide-react';
import api from '../utils/api';

const Transfer = () => {
  const [formData, setFormData] = useState({
    from_account: 'Savings Account',
    to_account: '',
    amount: '',
    note: ''
  });
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch current balance on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.user_id) {
      api.get(`/api/account_summary/${user.user_id}`)
        .then(res => {
          if (res.data.success) setBalance(res.data.summary.current_balance);
        })
        .catch(() => {});
    }
  }, []);

  const handleReuse = (account) => {
    setFormData(f => ({ ...f, to_account: account }));
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const amt = parseFloat(formData.amount);
    if (!formData.to_account.trim()) {
      setError('Please enter a destination account or UPI ID.');
      setLoading(false);
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      setLoading(false);
      return;
    }
    if (balance !== null && amt > balance) {
      setError(`Insufficient balance. Your current balance is ₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`);
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/api/transfer', formData);
      if (res.data.success) {
        setSuccess(true);
        // Update displayed balance
        if (res.data.new_balance !== undefined) setBalance(res.data.new_balance);
        setTimeout(() => setSuccess(false), 4000);
        setFormData(f => ({ ...f, to_account: '', amount: '', note: '' }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const recentBeneficiaries = [
    { name: 'Rahul Sharma', detail: 'Acc: 11029334', tag: 'REUSE' },
    { name: 'Priya Singh',  detail: 'UPI: priya@okicici', tag: 'REUSE' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Balance Banner ─────────────────────────────────────────── */}
      {balance !== null && (
        <div className="glass-panel rounded-2xl border border-primary/20 p-5 flex items-center justify-between shadow-glow-teal">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Available Balance</p>
              <p className="text-xl font-extrabold text-white text-glow-teal">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyber-green border border-cyber-green/30 bg-cyber-green/10 px-3 py-1 rounded-full">
            ● Account Balance
          </span>
        </div>
      )}

      {/* ── Transfer Form ───────────────────────────────────────────── */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-glow-teal">
            <Send className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Transfer Money</h1>
            <p className="text-slate-400 text-sm">Send money instantly to any bank account or UPI ID</p>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="bg-cyber-green/10 border border-cyber-green/40 text-cyber-green p-5 rounded-xl mb-6 flex items-center gap-4 animate-in zoom-in duration-300">
            <CheckCircle className="h-7 w-7 shrink-0" />
            <div>
              <p className="font-bold">Transfer Successful!</p>
              <p className="text-sm opacity-80">The amount has been debited and is being processed.</p>
            </div>
            <button onClick={() => setSuccess(false)} className="ml-auto opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError('')} className="ml-auto opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left column */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  From Account
                </label>
                <select
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono"
                  value={formData.from_account}
                  onChange={(e) => setFormData({ ...formData, from_account: e.target.value })}
                >
                  <option>Savings Account</option>
                  <option>Current Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 font-bold text-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                {/* Inline warning if over balance */}
                {balance !== null && parseFloat(formData.amount) > balance && (
                  <p className="mt-1 text-xs text-red-400 font-mono">⚠ Exceeds available balance</p>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  To Account / UPI ID
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter Acc No. or UPI ID"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono"
                    value={formData.to_account}
                    onChange={(e) => setFormData({ ...formData, to_account: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rent, Dinner, etc."
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading || (balance !== null && parseFloat(formData.amount) > balance)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-white text-slate-950 font-bold py-3 px-10 rounded-xl shadow-glow-teal hover:shadow-white/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-950 border-t-transparent"></div>
                  Processing…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Confirm Transfer
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Recent Beneficiaries ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentBeneficiaries.map((b, i) => (
          <div key={i} className="glass-panel-interactive rounded-xl border border-slate-800 p-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{b.name}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{b.detail}</p>
            </div>
            <button
              onClick={() => handleReuse(b.detail.split(': ')[1])}
              className="ml-auto text-[10px] font-bold text-primary hover:text-white border border-primary/30 hover:border-white/30 px-2 py-1 rounded-md transition-all shrink-0"
            >
              REUSE
            </button>
          </div>
        ))}

        {/* Add new beneficiary card */}
        <div className="glass-panel-interactive rounded-xl border border-slate-800 border-dashed p-5 flex items-center gap-3 cursor-pointer group">
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors">
            <Plus className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm font-bold text-slate-500 group-hover:text-slate-300 transition-colors">Add New Beneficiary</p>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
