import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Search, Users, LogOut, Bell } from 'lucide-react';
import InvestigatorDashboard from './pages/investigator/InvestigatorDashboard';
import CustomerPortal from './pages/customer/CustomerPortal';
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
      {/* Top Navbar: Only shown when logged in and not on the authentication page */}
      {!isAuthPage && user && (
        <header className="h-14 bg-[#161b27] border-b border-[#ffffff12] flex items-center justify-between px-6 shrink-0 z-20">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-wide">InsureGuard AI</span>
              <span className="text-[10px] text-blue-400 block leading-none font-mono">Explainable Fraud Intelligence v2.0</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {(user.role === 'INVESTIGATOR' || user.role === 'ADMIN') && (
              <NavLink
                to="/investigator"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Search className="h-3.5 w-3.5" />
                Investigator Workspace
              </NavLink>
            )}

            <NavLink
              to="/customer"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Users className="h-3.5 w-3.5" />
              Customer Portal
            </NavLink>
          </nav>

          {/* Right: User Pill & Logout Button */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            {/* Profile Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                {getUserInitials(user.full_name)}
              </div>
              <span className="text-xs text-slate-300 font-medium">
                {user.full_name || user.email}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                user.role === 'CUSTOMER'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {user.role}
              </span>
            </div>

            {/* Functional Log Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/8 hover:border-red-500/20 transition text-xs font-semibold"
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

          {/* Protected Customer Route */}
          <Route
            path="/customer"
            element={
              user ? <CustomerPortal /> : <Navigate to="/login" replace />
            }
          />

          {/* Root redirect: Login if unauthenticated, portal if authenticated */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={user.role === 'CUSTOMER' ? '/customer' : '/investigator'} replace />
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
