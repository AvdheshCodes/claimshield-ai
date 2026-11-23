import { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, RefreshCw, Info
} from 'lucide-react';
import { Claim, FraudFinding } from '../../types';
import api from '../../services/api';

interface Props {
  claim: Claim;
  onClaimUpdated?: (updatedClaim: Claim) => void;
}

const SEVERITY_CONFIG: Record<string, { label: string; badgeCls: string; dotColor: string }> = {
  CRITICAL: {
    label: 'Critical Priority',
    badgeCls: 'bg-[#FDF2F2] text-[#C44747] border-[#C44747]/25',
    dotColor: '#C44747'
  },
  HIGH: {
    label: 'High Priority',
    badgeCls: 'bg-[#FEF8EC] text-[#C58A27] border-[#C58A27]/25',
    dotColor: '#C58A27'
  },
  MEDIUM: {
    label: 'Standard Review',
    badgeCls: 'bg-[#EFF6FC] text-[#3478B8] border-[#3478B8]/25',
    dotColor: '#3478B8'
  },
  LOW: {
    label: 'Low Risk',
    badgeCls: 'bg-[#EBF5F0] text-[#25845A] border-[#25845A]/25',
    dotColor: '#25845A'
  },
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
      // Keep existing findings
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
  const score = claim.risk_score ?? activePoints;

  // Determine risk category label
  let riskCategory = 'Low Risk';
  let riskBadgeColor = 'bg-[#EBF5F0] text-[#25845A] border-[#25845A]/25';
  let progressBarColor = 'bg-[#25845A]';

  if (score >= 70) {
    riskCategory = 'High Priority Investigation';
    riskBadgeColor = 'bg-[#FDF2F2] text-[#C44747] border-[#C44747]/30';
    progressBarColor = 'bg-[#C44747]';
  } else if (score >= 45) {
    riskCategory = 'Enhanced Review';
    riskBadgeColor = 'bg-[#FEF8EC] text-[#C58A27] border-[#C58A27]/30';
    progressBarColor = 'bg-[#C58A27]';
  } else if (score >= 20) {
    riskCategory = 'Standard Review';
    riskBadgeColor = 'bg-[#EFF6FC] text-[#3478B8] border-[#3478B8]/30';
    progressBarColor = 'bg-[#3478B8]';
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white border border-[#E1E6EB] rounded-xl">
        <RefreshCw className="h-5 w-5 text-[#245B85] animate-spin" />
        <p className="text-xs text-[#526477]">Loading deterministic risk findings...</p>
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center bg-white border border-[#E1E6EB] rounded-xl p-6">
        <div className="w-12 h-12 rounded-lg bg-[#F4F6F8] border border-[#E1E6EB] flex items-center justify-center mb-3">
          <ShieldCheck className="h-6 w-6 text-[#25845A]" />
        </div>
        <h3 className="text-sm font-semibold text-[#0D1B2A]">No Risk Flags Identified</h3>
        <p className="text-xs text-[#526477] mt-1 max-w-sm leading-relaxed">
          All automated rule checks passed cleanly without inconsistencies or fraud indicators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── RESTING RISK ASSESSMENT SUMMARY CARD ─────────────── */}
      <div className="bg-white border border-[#E1E6EB] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E6EB]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${riskBadgeColor}`}>
                {riskCategory}
              </span>
              <span className="text-xs text-[#718096]">
                {findings.length} evaluated rule{findings.length !== 1 ? 's' : ''}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[#0D1B2A]">
              Deterministic Risk Score: <span className="tabular-nums font-mono">{score}</span>
              <span className="text-xs text-[#718096] font-normal"> / 100</span>
            </h3>
            <p className="text-xs text-[#526477] mt-0.5">
              Accumulated score based on 10 deterministic IRDAI fraud verification rules.
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-[#E1E6EB] sm:pl-6">
            <span className="text-xs font-medium text-[#718096] block">Active Risk Points</span>
            <span className="text-2xl font-bold text-[#0D1B2A] tabular-nums font-mono">{activePoints}</span>
            {findings.length - activeFindings.length > 0 && (
              <span className="text-[11px] text-[#718096] block mt-0.5">
                ({findings.length - activeFindings.length} dismissed)
              </span>
            )}
          </div>
        </div>

        {/* Restrained Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-[#526477] mb-1 font-medium">
            <span>Risk Threshold Scale</span>
            <span className="tabular-nums font-mono">{score}% of max risk threshold</span>
          </div>
          <div className="h-2 w-full bg-[#E1E6EB] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressBarColor}`}
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#718096] mt-1.5 font-mono">
            <span>0 - 24 (Low)</span>
            <span>25 - 49 (Standard)</span>
            <span>50 - 69 (Enhanced)</span>
            <span>70+ (High Priority)</span>
          </div>
        </div>
      </div>

      {/* ── ITEMIZED EVIDENCE & RULES SECTION ───────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-[#526477] uppercase tracking-wider">
            Triggered Rules & Forensic Evidence ({findings.length})
          </h4>
          <span className="text-xs text-[#718096]">
            Click row to inspect extraction evidence and record investigator verdict
          </span>
        </div>

        <div className="space-y-3">
          {findings.map((f, idx) => {
            const currentFeedback = feedbacks[f.id] || f.investigator_feedback || 'UNRESOLVED';
            const isDismissed = currentFeedback === 'DISMISSED';
            const isVerified = currentFeedback === 'VERIFIED';
            const sev = SEVERITY_CONFIG[f.severity] || SEVERITY_CONFIG['LOW'];
            const isExpanded = expanded === f.id;

            return (
              <div
                key={f.id || idx}
                className={`bg-white border rounded-xl transition shadow-sm ${
                  isDismissed
                    ? 'border-[#E1E6EB] opacity-60 bg-[#F4F6F8]'
                    : isExpanded
                    ? 'border-[#245B85]'
                    : 'border-[#E1E6EB] hover:border-[#CBD5E1]'
                }`}
              >
                {/* Finding Header Row */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : f.id)}
                  className="p-4 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: isDismissed ? '#718096' : sev.dotColor }}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-semibold text-[#142B45] bg-[#F4F6F8] px-2 py-0.5 rounded border border-[#E1E6EB]">
                          {f.rule_id}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${sev.badgeCls}`}>
                          {sev.label}
                        </span>
                        <span className="text-xs font-semibold text-[#0D1B2A] tabular-nums font-mono">
                          +{f.points} pts
                        </span>
                        {isVerified && (
                          <span className="text-[10px] font-semibold text-[#25845A] bg-[#EBF5F0] border border-[#25845A]/20 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Confirmed Finding
                          </span>
                        )}
                        {isDismissed && (
                          <span className="text-[10px] font-semibold text-[#718096] bg-[#F4F6F8] border border-[#E1E6EB] px-2 py-0.5 rounded flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Dismissed
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-semibold text-[#0D1B2A]">{f.rule_name}</h5>
                      <p className="text-xs text-[#526477] mt-0.5 line-clamp-1">{f.observation || (f as any).description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[#718096]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#718096]" />
                    )}
                  </div>
                </div>

                {/* Expanded Inspection Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#E1E6EB] space-y-4">
                    {/* Primary Evidence Snippet */}
                    {f.evidence_snippet && (
                      <div className="bg-[#F4F6F8] border border-[#E1E6EB] rounded-lg p-3">
                        <span className="text-[11px] font-semibold text-[#526477] uppercase tracking-wider block mb-1">
                          Extracted Evidence Snippet
                        </span>
                        <p className="text-xs font-mono text-[#0D1B2A] whitespace-pre-wrap leading-relaxed">
                          {f.evidence_snippet}
                        </p>
                      </div>
                    )}

                    {/* Alternative Explanation */}
                    {(f.potential_alternative_explanation || (f as any).alternative_explanation) && (
                      <div className="flex items-start gap-2 text-xs text-[#526477] bg-[#EFF6FC] border border-[#3478B8]/20 rounded-lg p-3">
                        <Info className="h-4 w-4 text-[#3478B8] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#142B45] block mb-0.5">Plausible Non-Fraud Explanation:</span>
                          <span>{f.potential_alternative_explanation || (f as any).alternative_explanation}</span>
                        </div>
                      </div>
                    )}

                    {/* Recommended Verification Steps */}
                    {(f.recommended_action || (f as any).recommended_verification) && (
                      <div className="text-xs text-[#526477]">
                        <span className="font-semibold text-[#0D1B2A] block mb-1">
                          Recommended Investigation Steps:
                        </span>
                        <p className="bg-white border border-[#E1E6EB] rounded-lg p-2.5">
                          {f.recommended_action || (f as any).recommended_verification}
                        </p>
                      </div>
                    )}

                    {/* Investigator Action Bar */}
                    <div className="pt-2 border-t border-[#E1E6EB] flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs text-[#718096]">Investigator Verification Action:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={updatingId === f.id}
                          onClick={() => handleFeedbackChange(f.id, 'VERIFIED')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                            isVerified
                              ? 'bg-[#25845A] text-white border-[#25845A]'
                              : 'bg-white hover:bg-[#EBF5F0] text-[#25845A] border-[#E1E6EB]'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Verify Finding</span>
                        </button>

                        <button
                          type="button"
                          disabled={updatingId === f.id}
                          onClick={() => handleFeedbackChange(f.id, 'DISMISSED')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                            isDismissed
                              ? 'bg-[#718096] text-white border-[#718096]'
                              : 'bg-white hover:bg-[#F4F6F8] text-[#526477] border-[#E1E6EB]'
                          }`}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Dismiss as False Positive</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
