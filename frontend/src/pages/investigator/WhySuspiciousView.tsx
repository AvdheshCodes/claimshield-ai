import React from 'react';
import { AlertCircle, CheckCircle, HelpCircle, FileCheck, ArrowRight, ShieldAlert } from 'lucide-react';
import { Claim, FraudFinding } from '../../types';

interface Props {
  claim: Claim;
}

export default function WhySuspiciousView({ claim }: Props) {
  // Demonstration findings matching Scenario B
  const findings: FraudFinding[] = [
    {
      id: "f1",
      claim_id: claim.id,
      rule_id: "RULE-003",
      rule_name: "Duplicate / Recycled Invoice Number",
      severity: "CRITICAL",
      points: 35,
      observation: "Repair invoice #INV-REPAIR-999 was previously settled under prior claim CS-2024-0004 at Metro Speed Auto Garage.",
      evidence_page_number: 1,
      evidence_snippet: "Invoice No: INV-REPAIR-999 | Garage: Metro Speed Auto",
      potential_alternative_explanation: "Billing system numbering sequence error or duplicate printout.",
      recommended_action: "Contact workshop ledger directly and demand verified bank GST billing statement.",
      investigator_feedback: "UNRESOLVED"
    },
    {
      id: "f2",
      claim_id: claim.id,
      rule_id: "RULE-010",
      rule_name: "Inconsistent Vehicle Registration",
      severity: "HIGH",
      points: 20,
      observation: "Repair bill lists vehicle registration 'DL05MN9999', which mismatches the policy schedule registration 'DL05MN5678'.",
      evidence_page_number: 1,
      evidence_snippet: "Vehicle Reg: DL05MN9999 (Schedule: DL05MN5678)",
      potential_alternative_explanation: "Typographical transcription error made by garage receptionist.",
      recommended_action: "Examine chassis VIN plate photograph and cross-reference with RTO database.",
      investigator_feedback: "UNRESOLVED"
    },
    {
      id: "f3",
      claim_id: claim.id,
      rule_id: "RULE-002",
      rule_name: "Incident Date Contradiction",
      severity: "HIGH",
      points: 15,
      observation: "Claim form records collision on 20/10/2024, but police traffic collision report certifies incident on 25/10/2024.",
      evidence_page_number: 1,
      evidence_snippet: "Police Diary Entry Date: 25/10/2024",
      potential_alternative_explanation: "Claimant reported delay in formal police complaint submission.",
      recommended_action: "Verify station diary dispatch record with Delhi Traffic Police Division.",
      investigator_feedback: "UNRESOLVED"
    },
    {
      id: "f4",
      claim_id: claim.id,
      rule_id: "RULE-001",
      rule_name: "Claimed Amount vs. Invoice Discrepancy",
      severity: "HIGH",
      points: 20,
      observation: "Total claimed amount is INR 95,000, whereas workshop invoice totals only INR 60,000 (36.8% variance).",
      evidence_page_number: 1,
      evidence_snippet: "Total Invoice: Rs. 60,000 (Claim: Rs. 95,000)",
      potential_alternative_explanation: "Claimant anticipated additional mechanical charges not included in initial estimate.",
      recommended_action: "Commission independent surveyor damage inspection report.",
      investigator_feedback: "UNRESOLVED"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Risk Summary Banner */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600 rounded-lg text-white">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-950">Deterministic Risk Assessment: {claim.risk_score}/100 ({claim.risk_band})</h3>
            <p className="text-xs text-red-700">4 distinct evidence indicators flagged across document forensic checks & historical records</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-800 bg-red-200/60 px-2.5 py-1 rounded">
            Enhanced Investigation Mandated
          </span>
        </div>
      </div>

      {/* Findings Breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Itemized Evidence Findings ({findings.length})</h4>
        
        {findings.map((f, i) => (
          <div key={f.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{f.rule_id}</span>
                <h5 className="font-semibold text-slate-900 text-sm">{f.rule_name}</h5>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">+{f.points} pts</span>
            </div>

            {/* Observation */}
            <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs">
              <span className="font-bold text-slate-900">EVIDENCE OBSERVATION: </span>
              {f.observation}
            </div>

            {/* Dual Column: Alternative Explanation vs Recommended Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg">
                <span className="font-bold text-blue-900 flex items-center gap-1 mb-1">
                  <HelpCircle className="h-3.5 w-3.5" /> Plausible Alternative Explanation
                </span>
                <p className="text-blue-800">{f.potential_alternative_explanation}</p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                <span className="font-bold text-emerald-900 flex items-center gap-1 mb-1">
                  <FileCheck className="h-3.5 w-3.5" /> Recommended Verification Step
                </span>
                <p className="text-emerald-800">{f.recommended_action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-500 text-center">
        ⚠️ <strong>Notice:</strong> Document discrepancies indicate areas requiring verification. They do not constitute automated proof of fraudulent intent. Human review is mandatory.
      </div>
    </div>
  );
}
