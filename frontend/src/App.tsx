import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Shield, Users, Search, Activity, FileText } from 'lucide-react';
import InvestigatorDashboard from './pages/investigator/InvestigatorDashboard';
import CustomerPortal from './pages/customer/CustomerPortal';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* Navigation Bar */}
        <header className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide">InsureGuard AI</span>
              <span className="text-xs text-blue-400 block font-mono">Explainable Fraud Intelligence v2.0</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/investigator" className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-800 transition">
              <Search className="h-4 w-4 text-amber-400" /> Investigator Workspace
            </Link>
            <Link to="/customer" className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-800 transition">
              <Users className="h-4 w-4 text-emerald-400" /> Customer Transparency Portal
            </Link>
          </nav>
        </header>

        {/* Content Area */}
        <main className="flex-1">
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
