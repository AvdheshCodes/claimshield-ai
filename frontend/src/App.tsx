import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { Shield, Search, Users, LayoutDashboard, LogOut, Bell, ChevronDown } from 'lucide-react';
import InvestigatorDashboard from './pages/investigator/InvestigatorDashboard';
import CustomerPortal from './pages/customer/CustomerPortal';

export default function App() {
  const [role, setRole] = useState<'INVESTIGATOR' | 'CUSTOMER'>('INVESTIGATOR');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0f1117] flex flex-col">

        {/* Top Navbar */}
        <header className="h-14 bg-[#161b27] border-b border-[#ffffff12] flex items-center justify-between px-6 shrink-0">
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

          {/* Right: User pill */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div
              onClick={() => setRole(r => r === 'INVESTIGATOR' ? 'CUSTOMER' : 'INVESTIGATOR')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                {role === 'INVESTIGATOR' ? 'AG' : 'CU'}
              </div>
              <span className="text-xs text-slate-300 font-medium">
                {role === 'INVESTIGATOR' ? 'Avdhesh G.' : 'Customer'}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${role === 'INVESTIGATOR' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {role}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/investigator" replace />} />
            <Route path="/investigator" element={<InvestigatorDashboard />} />
            <Route path="/customer" element={<CustomerPortal />} />
            <Route path="*" element={<Navigate to="/investigator" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
