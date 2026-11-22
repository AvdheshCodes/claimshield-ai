import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ShieldCheck, Users, Lock, Mail, Key, User as UserIcon,
  Phone, ArrowRight, AlertCircle, Loader2
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
    <div className="min-h-screen bg-[#F4F6F8] text-[#0D1B2A] flex flex-col justify-between">
      {/* Top Header Branding */}
      <header className="bg-white border-b border-[#E1E6EB] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#142B45] text-white rounded-lg flex items-center justify-center font-bold">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#142B45] leading-tight">
              ClaimShield AI
            </h1>
            <p className="text-[11px] text-[#526477]">Insurance Intelligence Platform · BFSI Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#526477] bg-[#F4F6F8] px-3 py-1.5 rounded border border-[#E1E6EB]">
          <Lock className="h-3.5 w-3.5 text-[#245B85]" />
          <span>IRDAI Compliant & 256-bit AES Encrypted</span>
        </div>
      </header>

      {/* Main Dual-Dialog Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#0D1B2A] mb-1">
            Enterprise Authentication Gateway
          </h2>
          <p className="text-sm text-[#526477] max-w-md mx-auto">
            Segregated access control for institutional investigators and policyholders.
          </p>
        </div>

        {/* The Two Dialog Boxes Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* ── DIALOG BOX 1: ADMIN & INVESTIGATOR ─────────────── */}
          <div className="bg-white border border-[#E1E6EB] rounded-xl p-7 flex flex-col justify-between shadow-sm hover:border-[#245B85]/40 transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-[#EFF6FC] text-[#245B85] border border-[#245B85]/20 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Enterprise Operations
                </span>
                <span className="text-xs text-[#718096] font-mono">PORTAL A</span>
              </div>

              <h3 className="text-lg font-semibold text-[#0D1B2A] mb-1">
                Claims Officer & Fraud Investigator
              </h3>
              <p className="text-xs text-[#526477] mb-5 leading-relaxed">
                Access deterministic fraud scoring, PyMuPDF forensic OCR artifacts, syndicate graphs, and case dossier generation.
              </p>

              {/* Mode Switcher: Login / Signup */}
              <div className="flex bg-[#F4F6F8] p-1 rounded-lg mb-5 border border-[#E1E6EB]">
                <button
                  type="button"
                  onClick={() => { setAdminMode('login'); setAdminError(''); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded transition ${
                    adminMode === 'login' ? 'bg-[#142B45] text-white shadow-sm' : 'text-[#526477] hover:text-[#0D1B2A]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAdminMode('signup'); setAdminError(''); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded transition ${
                    adminMode === 'signup' ? 'bg-[#142B45] text-white shadow-sm' : 'text-[#526477] hover:text-[#0D1B2A]'
                  }`}
                >
                  Register Officer
                </button>
              </div>

              {/* Error Alert */}
              {adminError && (
                <div className="mb-4 p-3 rounded-lg bg-[#FDF2F2] border border-[#C44747]/30 flex items-center gap-2 text-xs text-[#C44747]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                {adminMode === 'signup' && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-[#526477] block mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="h-4 w-4 text-[#718096] absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={e => setAdminName(e.target.value)}
                          placeholder="e.g. Rajesh Sharma"
                          className="w-full bg-white border border-[#E1E6EB] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0D1B2A] placeholder-[#718096] focus:outline-none focus:border-[#245B85] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#526477] block mb-1">
                        Role Designation
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAdminRole('INVESTIGATOR')}
                          className={`py-1.5 text-xs font-semibold rounded border transition ${
                            adminRole === 'INVESTIGATOR' ? 'bg-[#EFF6FC] border-[#245B85] text-[#245B85]' : 'border-[#E1E6EB] text-[#526477]'
                          }`}
                        >
                          Claims Investigator
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminRole('ADMIN')}
                          className={`py-1.5 text-xs font-semibold rounded border transition ${
                            adminRole === 'ADMIN' ? 'bg-[#EFF6FC] border-[#245B85] text-[#245B85]' : 'border-[#E1E6EB] text-[#526477]'
                          }`}
                        >
                          Risk Admin
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-medium text-[#526477] block mb-1">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-[#718096] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="investigator@insureguard.ai"
                      className="w-full bg-white border border-[#E1E6EB] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0D1B2A] placeholder-[#718096] focus:outline-none focus:border-[#245B85] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#526477] block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="h-4 w-4 text-[#718096] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white border border-[#E1E6EB] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0D1B2A] placeholder-[#718096] focus:outline-none focus:border-[#245B85] transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full py-2.5 bg-[#142B45] hover:bg-[#0D1B2A] disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2"
                >
                  {adminLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      {adminMode === 'login' ? 'Sign In to Investigation Workspace' : 'Complete Registration'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Demo Pre-Fill */}
            <div className="mt-6 pt-4 border-t border-[#E1E6EB] flex items-center justify-between text-xs">
              <span className="text-[#718096]">Test Credentials:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillAdminDemo('INVESTIGATOR')}
                  className="px-2.5 py-1 rounded bg-[#F4F6F8] hover:bg-[#E1E6EB] text-[#245B85] border border-[#E1E6EB] text-[11px] font-medium transition"
                >
                  Demo Investigator
                </button>
                <button
                  type="button"
                  onClick={() => fillAdminDemo('ADMIN')}
                  className="px-2.5 py-1 rounded bg-[#F4F6F8] hover:bg-[#E1E6EB] text-[#142B45] border border-[#E1E6EB] text-[11px] font-medium transition"
                >
                  Demo Admin
                </button>
              </div>
            </div>
          </div>

          {/* ── DIALOG BOX 2: POLICYHOLDER & CUSTOMER ──────────── */}
          <div className="bg-white border border-[#E1E6EB] rounded-xl p-7 flex flex-col justify-between shadow-sm hover:border-[#25845A]/40 transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-[#EBF5F0] text-[#25845A] border border-[#25845A]/20 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Policyholder Services
                </span>
                <span className="text-xs text-[#718096] font-mono">PORTAL B</span>
              </div>

              <h3 className="text-lg font-semibold text-[#0D1B2A] mb-1">
                Customer & Policyholder
              </h3>
              <p className="text-xs text-[#526477] mb-5 leading-relaxed">
                Track claim processing, upload requested documents, review settlement milestones, and monitor approval status.
              </p>

              {/* Mode Switcher: Login / Signup */}
              <div className="flex bg-[#F4F6F8] p-1 rounded-lg mb-5 border border-[#E1E6EB]">
                <button
                  type="button"
                  onClick={() => { setCustMode('login'); setCustError(''); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded transition ${
                    custMode === 'login' ? 'bg-[#25845A] text-white shadow-sm' : 'text-[#526477] hover:text-[#0D1B2A]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setCustMode('signup'); setCustError(''); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded transition ${
                    custMode === 'signup' ? 'bg-[#25845A] text-white shadow-sm' : 'text-[#526477] hover:text-[#0D1B2A]'
                  }`}
                >
                  Register Account
                </button>
              </div>

              {/* Error Alert */}
              {custError && (
                <div className="mb-4 p-3 rounded-lg bg-[#FDF2F2] border border-[#C44747]/30 flex items-center gap-2 text-xs text-[#C44747]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{custError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleCustSubmit} className="space-y-4">
                {custMode === 'signup' && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-[#526477] block mb-1">
                        Policyholder Name
                      </label>
                      <div className="relative">
                        <UserIcon className="h-4 w-4 text-[#718096] absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={custName}
                          onChange={e => setCustName(e.target.value)}
                          placeholder="e.g. Priya Verma"
                          className="w-full bg-white border border-[#E1E6EB] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0D1B2A] placeholder-[#718096] focus:outline-none focus:border-[#25845A] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#526477] block mb-1">
                        Contact Phone
                      </label>
                      <div className="relative">
                        <Phone className="h-4 w-4 text-[#718096] absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          value={custPhone}
                          onChange={e => setCustPhone(e.target.value)}
                          placeholder="+91-98765-00001"
                          className="w-full bg-white border border-[#E1E6EB] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0D1B2A] placeholder-[#718096] focus:outline-none focus:border-[#25845A] transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-medium text-[#526477] block mb-1">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-[#718096] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={custEmail}
                      onChange={e => setCustEmail(e.target.value)}
                      placeholder="customer@insureguard.ai"
                      className="w-full bg-white border border-[#E1E6EB] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0D1B2A] placeholder-[#718096] focus:outline-none focus:border-[#25845A] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#526477] block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="h-4 w-4 text-[#718096] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={custPassword}
                      onChange={e => setCustPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white border border-[#E1E6EB] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0D1B2A] placeholder-[#718096] focus:outline-none focus:border-[#25845A] transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={custLoading}
                  className="w-full py-2.5 bg-[#25845A] hover:bg-[#1E6B48] disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2"
                >
                  {custLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      {custMode === 'login' ? 'Sign In to Policyholder Portal' : 'Register Policyholder Profile'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Demo Pre-Fill */}
            <div className="mt-6 pt-4 border-t border-[#E1E6EB] flex items-center justify-between text-xs">
              <span className="text-[#718096]">Test Credentials:</span>
              <button
                type="button"
                onClick={fillCustomerDemo}
                className="px-2.5 py-1 rounded bg-[#F4F6F8] hover:bg-[#E1E6EB] text-[#25845A] border border-[#E1E6EB] text-[11px] font-medium transition"
              >
                Demo Policyholder
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Notice */}
      <footer className="bg-white border-t border-[#E1E6EB] px-8 py-3.5 text-center text-xs text-[#718096]">
        ClaimShield AI · Insurance Intelligence Platform · Strict Role-Based Access Control
      </footer>
    </div>
  );
}
