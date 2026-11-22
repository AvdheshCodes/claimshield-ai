import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ShieldCheck, Car } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col">

      {/* ── POLICYHOLDER TOP NAVBAR (When logged in as CUSTOMER) ── */}
      {!isAuthPage && user && user.role === 'CUSTOMER' && (
        <header className="h-14 bg-white border-b border-[#E1E6EB] flex items-center justify-between px-6 shrink-0 z-20">
          {/* Policyholder Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#142B45] text-white rounded-lg flex items-center justify-center font-bold">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#142B45] text-sm">ClaimShield AI</span>
              <span className="text-[11px] text-[#526477] block leading-none">Policyholder Self-Service Portal</span>
            </div>
          </div>

          {/* Right: Policyholder Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F4F6F8] border border-[#E1E6EB] text-xs">
              <Car className="h-3.5 w-3.5 text-[#245B85]" />
              <span className="font-mono text-[#0D1B2A] font-medium">DL05MN5678</span>
              <span className="text-[#CBD5E1]">|</span>
              <span className="text-[#526477]">POL-2026-9921</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F4F6F8] border border-[#E1E6EB]">
              <div className="w-6 h-6 rounded-full bg-[#25845A] flex items-center justify-center text-[10px] font-bold text-white">
                {getUserInitials(user.full_name)}
              </div>
              <span className="text-xs text-[#0D1B2A] font-medium">{user.full_name || 'Priya Verma'}</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#EBF5F0] text-[#25845A] border border-[#25845A]/25">
                POLICYHOLDER
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#526477] hover:text-[#C44747] hover:bg-[#FDF2F2] border border-[#E1E6EB] transition text-xs font-medium"
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
                  <InvestigatorDashboard user={user} onLogout={handleLogout} />
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
                  <InvestigatorDashboard user={user} onLogout={handleLogout} />
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
                <CustomerPortal />
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
