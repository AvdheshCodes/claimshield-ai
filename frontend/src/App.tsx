import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Search, Users, LogOut, Bell, ShieldCheck, Sliders, Car } from 'lucide-react';
import InvestigatorDashboard from './pages/investigator/InvestigatorDashboard';
import CustomerPortal from './pages/customer/CustomerPortal';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuthPage from './pages/auth/AuthPage';
import { User } from './types';

function AppContent() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('insureguard_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login';

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('insureguard_token');
    localStorage.removeItem('insureguard_user');
    setUser(null);
    navigate('/login');
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">

      {/* ── INTERFACE 1: DEDICATED CUSTOMER / POLICYHOLDER NAVBAR ───── */}
      {!isAuthPage && user && user.role === 'CUSTOMER' && (
        <header className="h-14 bg-[#0d161a] border-b border-emerald-500/20 flex items-center justify-between px-6 shrink-0 z-20">
          {/* Policyholder Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-wide">InsureGuard Policyholder Services</span>
              <span className="text-[10px] text-emerald-400 block leading-none font-mono">MyClaim Portal · Zero-Dep Auto Protection</span>
            </div>
          </div>

          {/* Right: Policyholder Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <Car className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-mono text-emerald-300 font-semibold">DL05MN5678</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">POL-2026-9921</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white">
                {getUserInitials(user.full_name)}
              </div>
              <span className="text-xs text-slate-200 font-medium">{user.full_name || 'Priya Verma'}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                POLICYHOLDER
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/8 transition text-xs font-semibold"
              title="Sign out of session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </header>
      )}

      {/* ── INTERFACE 2: DEDICATED ENTERPRISE ADMIN / INVESTIGATOR NAVBAR ─ */}
      {!isAuthPage && user && (user.role === 'INVESTIGATOR' || user.role === 'ADMIN') && (
        <header className="h-14 bg-[#141926] border-b border-[#ffffff12] flex items-center justify-between px-6 shrink-0 z-20">
          {/* Enterprise Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-wide">InsureGuard AI Enterprise</span>
              <span className="text-[10px] text-blue-400 block leading-none font-mono">Fraud Intelligence & Forensics Suite v2.0</span>
            </div>
          </div>

          {/* Nav Links for Enterprise */}
          <nav className="flex items-center gap-1">
            <NavLink
              to="/investigator"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Search className="h-3.5 w-3.5" />
              Investigation Workspace
            </NavLink>

            {user.role === 'ADMIN' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Sliders className="h-3.5 w-3.5" />
                Admin Governance
              </NavLink>
            )}
          </nav>

          {/* Right: User Pill & Logout Button */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                {getUserInitials(user.full_name)}
              </div>
              <span className="text-xs text-slate-200 font-medium">{user.full_name || user.email}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/8 transition text-xs font-semibold"
              title="Sign out of session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Routes */}
      <main className="flex-1 overflow-hidden">
        <Routes>
          {/* Authentication Gateway Route */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.role === 'CUSTOMER' ? '/customer' : '/investigator'} replace />
              ) : (
                <AuthPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          {/* Protected Investigator Route */}
          <Route
            path="/investigator"
            element={
              user ? (
                user.role === 'CUSTOMER' ? (
                  <Navigate to="/customer" replace />
                ) : (
                  <InvestigatorDashboard />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              user ? (
                user.role === 'ADMIN' ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/investigator" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Protected Customer Route */}
          <Route
            path="/customer"
            element={
              user ? (
                user.role === 'CUSTOMER' ? (
                  <CustomerPortal />
                ) : (
                  <CustomerPortal />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Root redirect: Login if unauthenticated, portal based on role if authenticated */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={user.role === 'CUSTOMER' ? '/customer' : (user.role === 'ADMIN' ? '/admin' : '/investigator')} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch-all */}
          <Route
            path="*"
            element={
              user ? (
                <Navigate to={user.role === 'CUSTOMER' ? '/customer' : '/investigator'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
