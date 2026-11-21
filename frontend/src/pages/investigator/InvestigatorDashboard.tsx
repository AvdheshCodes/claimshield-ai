import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, FileText, Share2, MessageSquare, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { Claim, FraudFinding, GraphData } from '../../types';
import WhySuspiciousView from './WhySuspiciousView';
import RelationshipGraphView from './RelationshipGraphView';
import CopilotChatView from './CopilotChatView';

export default function InvestigatorDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [activeTab, setActiveTab] = useState<'why-suspicious' | 'graph' | 'copilot'>('why-suspicious');
  const [loading, setLoading] = useState<boolean>(true);

  // Synthetic Demonstration Data Fallback
  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/claims');
      if (res.data && res.data.length > 0) {
        setClaims(res.data);
        setSelectedClaim(res.data[0]);
      } else {
        useFallbackClaims();
      }
    } catch {
      useFallbackClaims();
    } finally {
      setLoading(false);
    }
  };

  const useFallbackClaims = () => {
    const mockClaims: Claim[] = [
      {
        id: "c1111111-0000-0000-0000-000000000001",
        claim_number: "CS-2026-00002",
        customer_id: "u1",
        category: "MOTOR",
        status: "UNDER_INVESTIGATION",
        incident_date: "2024-10-20T00:00:00Z",
        incident_description: "Barakhamba Road collision with vehicle front-rear damage.",
        claimed_amount: 95000,
        vehicle_registration: "DL05MN5678",
        garage_name: "Metro Speed Auto Garage",
        risk_score: 85,
        risk_band: "VERY_HIGH",
        created_at: "2024-10-21T06:00:00Z"
      },
      {
        id: "c2222222-0000-0000-0000-000000000002",
        claim_number: "CS-2026-00001",
        customer_id: "u2",
        category: "MOTOR",
        status: "APPROVED",
        incident_date: "2024-10-15T00:00:00Z",
        incident_description: "Highway animal collision causing front bumper damage.",
        claimed_amount: 45000,
        vehicle_registration: "MH12AB1234",
        garage_name: "AutoFix Service Centre",
        risk_score: 12,
        risk_band: "LOW",
        created_at: "2024-10-16T08:00:00Z"
      }
    ];
    setClaims(mockClaims);
    setSelectedClaim(mockClaims[0]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fraud Investigation Command Center</h1>
          <p className="text-sm text-slate-500">Analyze evidence-backed indicators, document forensics, and entity syndicate graphs</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadClaims} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm flex items-center gap-1.5 transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Claims Queue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-[750px] flex flex-col">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Investigation Queue ({claims.length})</h2>
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {claims.map((claim) => (
              <div
                key={claim.id}
                onClick={() => setSelectedClaim(claim)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedClaim?.id === claim.id
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700">{claim.claim_number}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      claim.risk_band === 'VERY_HIGH'
                        ? 'bg-red-100 text-red-700'
                        : claim.risk_band === 'HIGH'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    Risk {claim.risk_score}/100
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-1">₹{claim.claimed_amount.toLocaleString()}</p>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{claim.incident_description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100">
                  <span>{claim.category}</span>
                  <span className="font-medium text-slate-600">{claim.status.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Claim Investigation Workspace */}
        <div className="lg:col-span-2 space-y-4">
          {selectedClaim && (
            <>
              {/* Workspace Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2">
                <button
                  onClick={() => setActiveTab('why-suspicious')}
                  className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition ${
                    activeTab === 'why-suspicious'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" /> WHY SUSPICIOUS? (Evidence)
                </button>
                <button
                  onClick={() => setActiveTab('graph')}
                  className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition ${
                    activeTab === 'graph'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Share2 className="h-4 w-4" /> Fraud Relationship Graph
                </button>
                <button
                  onClick={() => setActiveTab('copilot')}
                  className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition ${
                    activeTab === 'copilot'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" /> AI Copilot (Grounded Q&A)
                </button>
              </div>

              {/* Tab Views */}
              <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-sm p-6 min-h-[670px]">
                {activeTab === 'why-suspicious' && <WhySuspiciousView claim={selectedClaim} />}
                {activeTab === 'graph' && <RelationshipGraphView claimNumber={selectedClaim.claim_number} />}
                {activeTab === 'copilot' && <CopilotChatView claim={selectedClaim} />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
