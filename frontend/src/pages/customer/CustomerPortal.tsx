import React, { useState } from 'react';
import { Users, FileText, CheckCircle2, Clock, Upload, ArrowUpRight, HelpCircle } from 'lucide-react';

export default function CustomerPortal() {
  const [appealRequested, setAppealRequested] = useState(false);

  const milestones = [
    { title: "Claim Submitted", date: "21 Oct 2024", completed: true },
    { title: "Document Verification", date: "22 Oct 2024", completed: true },
    { title: "Review & Assessment", date: "In Progress", completed: false, current: true },
    { title: "Final Claim Settlement", date: "Pending", completed: false }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Claim Transparency Dashboard</h1>
          <p className="text-sm text-slate-500">Track claim verification milestones, upload requested documents, and request human review</p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
          Claim #CS-2026-00002
        </span>
      </div>

      {/* Progress Timeline (Privacy-by-Design: No internal fraud scores exposed) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Processing Milestones</h3>
        <div className="grid grid-cols-4 gap-4 relative">
          {milestones.map((m, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${
                  m.completed
                    ? 'bg-emerald-600 text-white'
                    : m.current
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {m.completed ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
              </div>
              <span className="text-xs font-bold text-slate-800">{m.title}</span>
              <span className="text-[11px] text-slate-400 mt-0.5">{m.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Document Action Required */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-amber-700" /> Action Requested by Claims Team
        </h3>
        <p className="text-xs text-amber-900 mb-4 leading-relaxed">
          Please provide a clear photograph of your vehicle's physical chassis VIN plate and an itemized breakdown of repair charges from the workshop to finalize review.
        </p>

        <div className="flex items-center gap-3">
          <label className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition">
            <Upload className="h-3.5 w-3.5" /> Upload Requested Documents
            <input type="file" className="hidden" />
          </label>
          <button
            onClick={() => setAppealRequested(true)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            {appealRequested ? "Human Review Appeal Registered" : "Request Human Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
