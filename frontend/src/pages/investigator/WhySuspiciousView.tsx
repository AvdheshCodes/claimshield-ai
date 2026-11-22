import React, { useState, useEffect } from 'react';
import { ShieldAlert, HelpCircle, FileCheck, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Claim, FraudFinding } from '../../types';
import api from '../../services/api';

interface Props {
  claim: Claim;
  onClaimUpdated?: (updatedClaim: Claim) => void;
}

const SEV_CONFIG: Record<string, { label: string; cls: string }> = {
  CRITICAL: { label: 'CRITICAL', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  HIGH:     { label: 'HIGH',     cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  MEDIUM:   { label: 'MEDIUM',   cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  LOW:      { label: 'LOW',      cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
};

type Feedback = 'UNRESOLVED' | 'VERIFIED' | 'DISMISSED';

export default function WhySuspiciousView({ claim, onClaimUpdated }: Props) {
  const [findings, setFindings] = useState<FraudFinding[]>((claim as any).findings ?? []);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if ((claim as any).findings && (claim as any).findings.length > 0) {
      setFindings((claim as any).findings);
      setExpanded((claim as any).findings[0]?.id ?? null);
      const initialFb: Record<string, Feedback> = {};
      (claim as any).findings.forEach((f: any) => {
        initialFb[f.id] = (f.investigator_feedback as Feedback) || 'UNRESOLVED';
      });
      setFeedbacks(initialFb);
    } else {
      fetchFindings();
    }
  }, [claim.id]);

  const fetchFindings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/claims/${claim.id}/findings`);
      if (res.data) {
        setFindings(res.data);
        if (res.data.length > 0) {
          setExpanded(res.data[0].id);
          const fbMap: Record<string, Feedback> = {};
          res.data.forEach((f: any) => {
            fbMap[f.id] = (f.investigator_feedback as Feedback) || 'UNRESOLVED';
          });
          setFeedbacks(fbMap);
        }
      }
    } catch {
      // keep current findings
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = async (findingId: string, newFeedback: Feedback) => {
    setUpdatingId(findingId);
    try {
      const res = await api.patch(`/claims/${claim.id}/findings/${findingId}`, {
        feedback: newFeedback
      });
      setFeedbacks(prev => ({ ...prev, [findingId]: newFeedback }));

      if (res.data?.updated_claim_score !== undefined && onClaimUpdated) {
        onClaimUpdated({
          ...claim,
          risk_score: res.data.updated_claim_score,
          risk_band: res.data.updated_risk_band
        });
      }
    } catch (err) {
      console.error("Failed to update feedback:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const activeFindings = findings.filter(f => (feedbacks[f.id] || f.investigator_feedback) !== 'DISMISSED');
  const activePoints = activeFindings.reduce((s, f) => s + f.points, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
        <p className="text-sm text-slate-500">Loading fraud findings...</p>
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-full bg-white/4 border border-white/8 flex items-center justify-center mb-4">
          <Inbox className="h-7 w-7 text-slate-600" />
        </div>
        <h3 className="text-base font-bold text-slate-400">No Fraud Findings Yet</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-xs leading-relaxed">
          Upload and submit claim documents on the left panel to trigger explainable fraud indicators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Risk Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-red-500/8 p-5">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Deterministic Risk Score: <span className="text-red-400">{claim.risk_score ?? activePoints}/100</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {findings.length} evidence indicator{findings.length !== 1 ? 's' : ''} · {activePoints} active risk points
                {findings.length - activeFindings.length > 0 && ` (${findings.length - activeFindings.length} dismissed by investigator)`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/15 border border-red-500/30 px-3 py-1.5 rounded-lg">
            Enhanced Investigation Mandated
          </span>
        </div>
        <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-600 transition-all"
            style={{ width: `${claim.risk_score ?? activePoints}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-600 mt-1 font-mono">
          <span>0 — LOW</span><span>25 — MEDIUM</span><span>50 — HIGH</span><span>75+ — VERY HIGH</span>
        </div>
      </div>

      {/* Findings list */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Itemized Evidence ({findings.length} findings)
        </h4>

        {findings.map(f => {
          const sev = SEV_CONFIG[f.severity] ?? SEV_CONFIG['LOW'];
          const fb = feedbacks[f.id] ?? f.investigator_feedback ?? 'UNRESOLVED';
          const isOpen = expanded === f.id;
          const isDismissed = fb === 'DISMISSED';

          return (
            <div
              key={f.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isDismissed
                  ? 'opacity-60 bg-[#121622] border-white/5'
                  : isOpen
                  ? 'border-white/15 bg-[#1a2033]'
                  : 'border-white/6 bg-[#161b27] hover:border-white/12'
              }`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : f.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${sev.cls}`}>{sev.label}</span>
                <span className="font-mono text-[10px] text-slate-600">{f.rule_id}</span>
                <span className={`flex-1 text-sm font-semibold ${isDismissed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {f.rule_name}
                </span>
                <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 ${
                  fb === 'VERIFIED' ? 'text-emerald-400' : isDismissed ? 'text-slate-600 line-through' : 'text-amber-400'
                }`}>
                  +{f.points} pts
                </span>
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                  <div className="bg-[#0f1117] rounded-xl border border-white/6 p-3.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Evidence Observation</p>
                    <p className="text-sm text-slate-200 leading-relaxed">{f.observation}</p>
                    {f.evidence_snippet && (
                      <div className="mt-2 font-mono text-[11px] bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-slate-400">
                        📎 {f.evidence_snippet}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Alternative Explanation</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{f.potential_alternative_explanation}</p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Recommended Action</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{f.recommended_action}</p>
                    </div>
                  </div>

                  {/* Investigator feedback buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 uppercase tracking-wider mr-1">Investigator Feedback:</span>
                      {(['VERIFIED', 'UNRESOLVED', 'DISMISSED'] as Feedback[]).map(opt => (
                        <button
                          key={opt}
                          disabled={updatingId === f.id}
                          onClick={() => handleFeedbackChange(f.id, opt)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            fb === opt
                              ? opt === 'VERIFIED'   ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : opt === 'DISMISSED'  ? 'bg-slate-700 text-slate-400 border-slate-600'
                              :                        'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-transparent text-slate-600 border-white/8 hover:border-white/20 hover:text-slate-400'
                          }`}
                        >
                          {opt === 'VERIFIED' ? '✓ Verified by Investigator' : opt === 'DISMISSED' ? '✗ Dismiss (Benign)' : '⚠ Unresolved'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-3 p-3.5 bg-white/3 border border-white/8 rounded-xl">
        <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Notice:</strong> Document discrepancies indicate areas requiring verification.
          They do not constitute automated proof of fraudulent intent. Human investigator review is mandatory before any claim decision.
        </p>
      </div>
    </div>
  );
}
