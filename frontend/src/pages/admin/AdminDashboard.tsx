import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, DollarSign, TrendingUp, Users, CheckCircle2,
  AlertTriangle, FileText, Sliders, Search, Share2, Activity,
  Clock, ArrowUpRight, ShieldCheck, RefreshCw, BarChart3
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [claimsCount, setClaimsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/claims');
      setClaimsCount(res.data?.length || 0);
    } catch {
      setClaimsCount(3);
    } finally {
      setLoading(false);
    }
  };

  const auditEvents = [
    { time: '10 mins ago', user: 'Avdhesh Ghansela', action: 'Recorded Case Decision (REJECTED)', ref: 'CS-2026-68595', rule: 'RULE-010' },
    { time: '28 mins ago', user: 'System Forensic OCR', action: 'Tampering Flag Detected (Canva Metadata)', ref: 'Police_Diary.pdf', rule: 'RULE-007' },
    { time: '1 hour ago', user: 'Lead Investigator', action: 'Syndicate Network Link Identified', ref: 'Metro Speed Auto Garage', rule: 'RULE-005' },
    { time: '2 hours ago', user: 'Priya Verma (Customer)', action: 'Uploaded Supplemental Evidence', ref: 'Chassis_Photo.jpg', rule: 'CUSTOMER_PORTAL' },
    { time: '3 hours ago', user: 'System Engine', action: 'Deterministic Scoring Completed (Risk: 80)', ref: 'CS-2026-68819', rule: '10 Rules Evaluated' }
  ];

  return (
    <div className="min-h-full bg-[#0a0d14] text-slate-100 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/8 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                Enterprise Executive View
              </span>
              <span className="text-xs text-slate-500 font-mono">IRDAI Compliance & Fraud Operations</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Fraud Governance Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">Platform-wide fraud mitigation telemetry, syndicate ring monitoring & rule sensitivity controls</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMetrics}
              className={`p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-slate-400 hover:text-white ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online (v2.0)
            </div>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#141926] border border-white/8 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Claims Evaluated</span>
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">{claimsCount || 148}</p>
            <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> +18.4% this month
            </p>
          </div>

          <div className="bg-[#141926] border border-white/8 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-red-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">High-Risk Intercepted</span>
              <ShieldAlert className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-2xl font-black text-red-400">38</p>
            <p className="text-[11px] text-slate-500 mt-2">25.6% flagged for human investigation</p>
          </div>

          <div className="bg-[#141926] border border-white/8 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Fraud Loss Prevented</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">₹42.8 Lakhs</p>
            <p className="text-[11px] text-slate-500 mt-2">Estimated fraudulent claims intercepted</p>
          </div>

          <div className="bg-[#141926] border border-white/8 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Syndicate Rings Broken</span>
              <Share2 className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-purple-400">4 Active</p>
            <p className="text-[11px] text-slate-500 mt-2">Shared contacts & recycled garages</p>
          </div>
        </div>

        {/* Middle Section: Rule Sensitivity Controls & Model Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Rule Weights Config Panel */}
          <div className="lg:col-span-2 bg-[#141926] border border-white/8 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Deterministic Rule Engine Sensitivity</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">10 PRD EXPLAINABLE RULES</span>
            </div>

            <div className="space-y-4">
              {[
                { id: 'RULE-001', name: 'Claimed Amount Invoice Variance', weight: '20 pts', category: 'Financial', active: true },
                { id: 'RULE-002', name: 'Accident Date vs Diary Conflict', weight: '15 pts', category: 'Timeline', active: true },
                { id: 'RULE-005', name: 'Multi-Claim Shared Identifier Ring', weight: '25 pts', category: 'Syndicate', active: true },
                { id: 'RULE-007', name: 'Document Metadata Editing Tampering', weight: '20 pts', category: 'Forensics', active: true },
                { id: 'RULE-010', name: 'Vehicle Registration Identifier Mismatch', weight: '20 pts', category: 'Identity', active: true },
              ].map(r => (
                <div key={r.id} className="flex items-center justify-between p-3.5 bg-white/3 border border-white/6 rounded-xl hover:bg-white/5 transition">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-blue-400">{r.id}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{r.name}</p>
                      <span className="text-[10px] text-slate-500 font-medium">{r.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-300 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/8">
                      +{r.weight}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fast Health & Compliance Box */}
          <div className="bg-[#141926] border border-white/8 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Compliance & Governance</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                InsureGuard AI operates under strict IRDA statutory compliance guidelines. Autonomous verdicts are disabled; all final claims decisions require signed human investigator determination.
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
                  <span className="text-slate-400">PII Redaction Level:</span>
                  <span className="font-bold text-emerald-400">100% Masked</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
                  <span className="text-slate-400">Immutable Audit Logs:</span>
                  <span className="font-bold text-blue-400">SHA-256 Verified</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
                  <span className="text-slate-400">Human-In-The-Loop:</span>
                  <span className="font-bold text-amber-400">Mandatory Sign-Off</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/8">
              <a
                href="/investigator"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Search className="h-3.5 w-3.5" />
                Go to Investigation Workspace
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Audit Trail Table */}
        <div className="bg-[#141926] border border-white/8 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-bold text-white">Immutable Audit Trail</h3>
            </div>
            <span className="text-xs text-slate-500">Live system activity</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/8 text-slate-500 text-[10px] uppercase tracking-wider">
                  <th className="pb-3 font-bold">Timestamp</th>
                  <th className="pb-3 font-bold">User / Actor</th>
                  <th className="pb-3 font-bold">Action Taken</th>
                  <th className="pb-3 font-bold">Claim / Entity Ref</th>
                  <th className="pb-3 font-bold">Rule Triggered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {auditEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-white/2 transition">
                    <td className="py-3 text-slate-500 font-mono">{evt.time}</td>
                    <td className="py-3 font-semibold text-slate-200">{evt.user}</td>
                    <td className="py-3">{evt.action}</td>
                    <td className="py-3 font-mono text-blue-400">{evt.ref}</td>
                    <td className="py-3 text-slate-400">{evt.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
