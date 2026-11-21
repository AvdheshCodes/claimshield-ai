import React, { useState } from 'react';
import { ShieldAlert, HelpCircle, FileCheck, ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Claim, FraudFinding } from '../../types';

interface Props { claim: Claim; }

const FINDINGS: FraudFinding[] = [
  {
    id: 'f1', claim_id: 'c1', rule_id: 'RULE-003',
    rule_name: 'Duplicate / Recycled Invoice Number',
    severity: 'CRITICAL', points: 35,
    observation: 'Repair invoice #INV-REPAIR-999 was previously settled under prior claim CS-2024-0004 at Metro Speed Auto Garage.',
    evidence_page_number: 1,
    evidence_snippet: 'Invoice No: INV-REPAIR-999 | Garage: Metro Speed Auto',
    potential_alternative_explanation: 'Billing system numbering sequence error or duplicate printout.',
    recommended_action: 'Contact workshop ledger directly and demand verified bank GST billing statement.',
    investigator_feedback: 'UNRESOLVED',
  },
  {
    id: 'f2', claim_id: 'c1', rule_id: 'RULE-010',
    rule_name: 'Inconsistent Vehicle Registration',
    severity: 'HIGH', points: 20,
    observation: "Repair bill lists vehicle registration 'DL05MN9999', which mismatches the policy schedule registration 'DL05MN5678'.",
    evidence_page_number: 1,
    evidence_snippet: 'Vehicle Reg: DL05MN9999 (Schedule: DL05MN5678)',
    potential_alternative_explanation: 'Typographical transcription error made by garage receptionist.',
    recommended_action: 'Examine chassis VIN plate photograph and cross-reference with RTO database.',
    investigator_feedback: 'UNRESOLVED',
  },
  {
    id: 'f3', claim_id: 'c1', rule_id: 'RULE-002',
    rule_name: 'Incident Date Contradiction',
    severity: 'HIGH', points: 15,
    observation: 'Claim form records collision on 20/10/2024, but police traffic collision report certifies incident on 25/10/2024.',
    evidence_page_number: 1,
    evidence_snippet: 'Police Diary Entry Date: 25/10/2024',
    potential_alternative_explanation: 'Claimant reported delay in formal police complaint submission.',
    recommended_action: 'Verify station diary dispatch record with Delhi Traffic Police Division.',
    investigator_feedback: 'UNRESOLVED',
  },
  {
    id: 'f4', claim_id: 'c1', rule_id: 'RULE-001',
    rule_name: 'Claimed Amount vs. Invoice Discrepancy',
    severity: 'HIGH', points: 20,
    observation: 'Total claimed amount is INR 95,000, whereas workshop invoice totals only INR 60,000 (36.8% variance).',
    evidence_page_number: 1,
    evidence_snippet: 'Total Invoice: Rs. 60,000 (Claim: Rs. 95,000)',
    potential_alternative_explanation: 'Claimant anticipated additional mechanical charges not included in initial estimate.',
    recommended_action: 'Commission independent surveyor damage inspection report.',
    investigator_feedback: 'UNRESOLVED',
  },
];

const SEV_CONFIG = {
  CRITICAL: { label: 'CRITICAL', cls: 'bg-red-500/15 text-red-400 border-red-500/30', bar: 'bg-red-500' },
  HIGH:     { label: 'HIGH',     cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30', bar: 'bg-orange-500' },
  MEDIUM:   { label: 'MEDIUM',   cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', bar: 'bg-yellow-500' },
  LOW:      { label: 'LOW',      cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30', bar: 'bg-blue-400' },
};

type Feedback = 'UNRESOLVED' | 'VERIFIED' | 'DISMISSED';

export default function WhySuspiciousView({ claim }: Props) {
  const findings = claim.risk_score && claim.risk_score > 50 ? FINDINGS : [];
  const [expanded, setExpanded] = useState<string | null>('f1');
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback>>(
    Object.fromEntries(FINDINGS.map(f => [f.id, 'UNRESOLVED']))
  );

  const totalPoints = findings.reduce((s, f) => s + f.points, 0);

  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-base font-bold text-slate-200">No Suspicious Indicators</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">This claim passed all deterministic fraud checks. Risk score is within normal range.</p>
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
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center glow-red">
              <ShieldAlert className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Deterministic Risk Score: <span className="text-red-400">{claim.risk_score}/100</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {findings.length} evidence indicators · {totalPoints} cumulative risk points
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/15 border border-red-500/30 px-3 py-1.5 rounded-lg">
              Enhanced Investigation Mandated
            </span>
          </div>
        </div>

        {/* Risk bar */}
        <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-600 transition-all"
            style={{ width: `${claim.risk_score}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-600 mt-1 font-mono">
          <span>0 — LOW</span><span>25 — MEDIUM</span><span>50 — HIGH</span><span>75+ — VERY HIGH</span>
        </div>
      </div>

      {/* Findings */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Itemized Evidence ({findings.length} findings)
        </h4>

        {findings.map((f) => {
          const sev = SEV_CONFIG[f.severity];
          const fb = feedbacks[f.id];
          const isOpen = expanded === f.id;

          return (
            <div
              key={f.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen ? 'border-white/15 bg-[#1a2033]' : 'border-white/6 bg-[#161b27] hover:border-white/12'
              }`}
            >
              {/* Finding header */}
              <button
                onClick={() => setExpanded(isOpen ? null : f.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${sev.cls}`}>
                  {sev.label}
                </span>
                <span className="font-mono text-[10px] text-slate-600">{f.rule_id}</span>
                <span className="flex-1 text-sm font-semibold text-slate-200">{f.rule_name}</span>
                <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 ${
                  fb === 'VERIFIED' ? 'text-emerald-400' : fb === 'DISMISSED' ? 'text-slate-500' : 'text-amber-400'
                }`}>+{f.points} pts</span>
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />}
              </button>

              {/* Expanded body */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                  {/* Observation */}
                  <div className="bg-[#0f1117] rounded-xl border border-white/6 p-3.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Evidence Observation</p>
                    <p className="text-sm text-slate-200 leading-relaxed">{f.observation}</p>
                    {f.evidence_snippet && (
                      <div className="mt-2 font-mono text-[11px] bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-slate-400">
                        📎 {f.evidence_snippet} · Page {f.evidence_page_number}
                      </div>
                    )}
                  </div>

                  {/* Two columns */}
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
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-600 uppercase tracking-wider mr-1">Mark as:</span>
                    {(['VERIFIED', 'UNRESOLVED', 'DISMISSED'] as Feedback[]).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setFeedbacks(prev => ({ ...prev, [f.id]: opt }))}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          fb === opt
                            ? opt === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : opt === 'DISMISSED' ? 'bg-slate-700 text-slate-400 border-slate-600'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-transparent text-slate-600 border-white/8 hover:border-white/20 hover:text-slate-400'
                        }`}
                      >
                        {opt === 'VERIFIED' ? '✓ Verified' : opt === 'DISMISSED' ? '✗ Dismiss' : '⚠ Unresolved'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
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
