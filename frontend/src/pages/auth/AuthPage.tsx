import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ShieldCheck, Users, Lock, Mail, Key, User as UserIcon,
  Phone, ArrowRight, Sparkles, AlertCircle, Loader2, CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const navigate = useNavigate();

  // Admin / Investigator State
  const [adminMode, setAdminMode] = useState<'login' | 'signup'>('login');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminRole, setAdminRole] = useState<'INVESTIGATOR' | 'ADMIN'>('INVESTIGATOR');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Customer State
  const [custMode, setCustMode] = useState<'login' | 'signup'>('login');
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custLoading, setCustLoading] = useState(false);
  const [custError, setCustError] = useState('');

  // Demo Fill Helpers
  const fillAdminDemo = (role: 'INVESTIGATOR' | 'ADMIN' = 'INVESTIGATOR') => {
    setAdminMode('login');
    setAdminError('');
    if (role === 'INVESTIGATOR') {
      setAdminEmail('investigator@insureguard.ai');
      setAdminPassword('investigator123');
    } else {
      setAdminEmail('admin@insureguard.ai');
      setAdminPassword('admin123');
    }
  };

  const fillCustomerDemo = () => {
    setCustMode('login');
    setCustError('');
    setCustEmail('customer@insureguard.ai');
    setCustPassword('customer123');
  };

  // Submit Admin / Investigator
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);

    try {
      if (adminMode === 'login') {
        const res = await api.post('/auth/login', {
          email: adminEmail,
          password: adminPassword
        });
        localStorage.setItem('insureguard_token', res.data.access_token);
        localStorage.setItem('insureguard_user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user);
        navigate('/investigator');
      } else {
        // Sign up
        await api.post('/auth/register', {
          email: adminEmail,
          password: adminPassword,
          full_name: adminName,
          phone_number: adminPhone || undefined,
          role: adminRole
        });
        // Auto-login after registration
        const loginRes = await api.post('/auth/login', {
          email: adminEmail,
          password: adminPassword
        });
        localStorage.setItem('insureguard_token', loginRes.data.access_token);
        localStorage.setItem('insureguard_user', JSON.stringify(loginRes.data.user));
        onLoginSuccess(loginRes.data.user);
        navigate('/investigator');
      }
    } catch (err: any) {
      setAdminError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Submit Customer
  const handleCustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustError('');
    setCustLoading(true);

    try {
      if (custMode === 'login') {
        const res = await api.post('/auth/login', {
          email: custEmail,
          password: custPassword
        });
        localStorage.setItem('insureguard_token', res.data.access_token);
        localStorage.setItem('insureguard_user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user);
        navigate('/customer');
      } else {
        // Sign up
        await api.post('/auth/register', {
          email: custEmail,
          password: custPassword,
          full_name: custName,
          phone_number: custPhone || undefined,
          role: 'CUSTOMER'
        });
        // Auto-login after registration
        const loginRes = await api.post('/auth/login', {
          email: custEmail,
          password: custPassword
        });
        localStorage.setItem('insureguard_token', loginRes.data.access_token);
        localStorage.setItem('insureguard_user', JSON.stringify(loginRes.data.user));
        onLoginSuccess(loginRes.data.user);
        navigate('/customer');
      }
    } catch (err: any) {
      setCustError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setCustLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Glow Orbs */}
      <div className="absolute top-[-15%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[20%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Branding */}
      <header className="px-8 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              InsureGuard AI
            </h1>
            <p className="text-[11px] font-mono text-blue-400">Explainable Fraud Intelligence Platform v2.0</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-white/4 px-3 py-1.5 rounded-full border border-white/8">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Visionet Techthon 2026 Submission</span>
        </div>
      </header>

      {/* Main Dual-Dialog Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-6 flex flex-col justify-center z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Secure Authentication Gateway
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Select your dedicated portal below. Access is segregated between Enterprise Fraud Investigators and Policyholders.
          </p>
        </div>

        {/* The Two Dialog Boxes Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* ── DIALOG BOX 1: ADMIN & INVESTIGATOR ─────────────── */}
          <div className="bg-[#141926]/90 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-blue-950/40 relative group hover:border-blue-500/50 transition-all">
            {/* Top Pill & Title */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Enterprise Portal
                </span>
                <span className="text-xs text-slate-500 font-mono">PORTAL A</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                Fraud Investigator & Admin
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Analyze forensic document integrity, multi-claim syndicate graphs, explainable rules, and export legal case dossiers.
              </p>

              {/* Mode Switcher: Login / Signup */}
              <div className="flex bg-[#0f131d] p-1 rounded-xl mb-6 border border-white/8">
                <button
                  type="button"
                  onClick={() => { setAdminMode('login'); setAdminError(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    adminMode === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAdminMode('signup'); setAdminError(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    adminMode === 'signup' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Alert */}
              {adminError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                {adminMode === 'signup' && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={e => setAdminName(e.target.value)}
                          placeholder="e.g. Avdhesh Ghansela"
                          className="w-full bg-[#0d111a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Role Designation
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAdminRole('INVESTIGATOR')}
                          className={`py-2 text-xs font-semibold rounded-xl border transition ${
                            adminRole === 'INVESTIGATOR' ? 'bg-blue-600/25 border-blue-500 text-blue-300' : 'border-white/10 text-slate-400'
                          }`}
                        >
                          Fraud Investigator
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminRole('ADMIN')}
                          className={`py-2 text-xs font-semibold rounded-xl border transition ${
                            adminRole === 'ADMIN' ? 'bg-blue-600/25 border-blue-500 text-blue-300' : 'border-white/10 text-slate-400'
                          }`}
                        >
                          System Admin
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="investigator@insureguard.ai"
                      className="w-full bg-[#0d111a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#0d111a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  {adminLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating Credentials...
                    </>
                  ) : (
                    <>
                      {adminMode === 'login' ? 'Sign In as Investigator' : 'Register & Enter Workspace'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Demo Pre-Fill */}
            <div className="mt-6 pt-4 border-t border-white/8 flex items-center justify-between text-xs">
              <span className="text-slate-500">Quick Test Credentials:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillAdminDemo('INVESTIGATOR')}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[11px] font-mono transition"
                >
                  ⚡ Fill Investigator
                </button>
                <button
                  type="button"
                  onClick={() => fillAdminDemo('ADMIN')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[11px] font-mono transition"
                >
                  ⚡ Fill Admin
                </button>
              </div>
            </div>
          </div>


          {/* ── DIALOG BOX 2: POLICYHOLDER & CUSTOMER ──────────── */}
          <div className="bg-[#141926]/90 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-emerald-950/40 relative group hover:border-emerald-500/50 transition-all">
            {/* Top Pill & Title */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Policyholder Portal
                </span>
                <span className="text-xs text-slate-500 font-mono">PORTAL B</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                Customer & Policyholder
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Track real-time claim status, upload supplemental evidence requested by investigators, and review settlement milestones.
              </p>

              {/* Mode Switcher: Login / Signup */}
              <div className="flex bg-[#0f131d] p-1 rounded-xl mb-6 border border-white/8">
                <button
                  type="button"
                  onClick={() => { setCustMode('login'); setCustError(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    custMode === 'login' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setCustMode('signup'); setCustError(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    custMode === 'signup' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register Policyholder
                </button>
              </div>

              {/* Error Alert */}
              {custError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{custError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleCustSubmit} className="space-y-4">
                {custMode === 'signup' && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={custName}
                          onChange={e => setCustName(e.target.value)}
                          placeholder="e.g. Priya Verma"
                          className="w-full bg-[#0d111a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Contact Phone
                      </label>
                      <div className="relative">
                        <Phone className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          value={custPhone}
                          onChange={e => setCustPhone(e.target.value)}
                          placeholder="+91-98765-00001"
                          className="w-full bg-[#0d111a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={custEmail}
                      onChange={e => setCustEmail(e.target.value)}
                      placeholder="customer@insureguard.ai"
                      className="w-full bg-[#0d111a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={custPassword}
                      onChange={e => setCustPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#0d111a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={custLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  {custLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating Claimant...
                    </>
                  ) : (
                    <>
                      {custMode === 'login' ? 'Sign In as Policyholder' : 'Register Policyholder Profile'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Demo Pre-Fill */}
            <div className="mt-6 pt-4 border-t border-white/8 flex items-center justify-between text-xs">
              <span className="text-slate-500">Quick Test Credentials:</span>
              <button
                type="button"
                onClick={fillCustomerDemo}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono transition"
              >
                ⚡ Fill Policyholder
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Notice */}
      <footer className="px-8 py-4 text-center text-xs text-slate-600 border-t border-white/5 z-10">
        InsureGuard AI Enterprise Claims Platform · Visionet Techthon 2026 · Role-based access control with AES/JWT token encryption.
      </footer>
    </div>
  );
}
