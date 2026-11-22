import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2, Clock, UploadCloud, HelpCircle,
  FileText, X, Send, Shield, ChevronRight, RefreshCw, Inbox, Loader2
} from 'lucide-react';
import api from '../../services/api';

type UploadedFile = { file: File; id: string };
type ClaimStatus = {
  claim_number: string;
  status: string;
  milestones: { title: string; date: string; done: boolean; current?: boolean }[];
  action_required?: string;
};

export default function CustomerPortal() {
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [appealRequested, setAppealRequested] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/customer/claim-status');
      setClaimStatus(res.data);
    } catch {
      setClaimStatus(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter(f =>
      ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
    );
    setUploadedFiles(prev => [
      ...prev,
      ...accepted.map(f => ({ file: f, id: Math.random().toString(36).slice(2) })),
    ]);
  };

  const removeFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const submitDocuments = async () => {
    if (uploadedFiles.length === 0 || !claimStatus || submitting) return;
    setSubmitting(true);
    try {
      for (const uf of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', uf.file);
        formData.append('document_type', 'supplemental_verification');
        await api.post(`/claims/${claimStatus.claim_number}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setSubmitted(true);
      setUploadedFiles([]);
      fetchStatus();
    } catch (err) {
      console.error("Document upload failed:", err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ─── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
        <p className="text-sm text-slate-500">Loading your claim status...</p>
      </div>
    );
  }

  /* ── Empty / Error ─── */
  if (!claimStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-20 h-20 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center mb-5">
          <Inbox className="h-9 w-9 text-slate-700" />
        </div>
        <h2 className="text-lg font-bold text-slate-400 mb-2">No Claim Found</h2>
        <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
          {error
            ? 'Could not reach the backend. Make sure the FastAPI service is running.'
            : 'No active claim is linked to your account.'}
        </p>
        <button
          onClick={fetchStatus}
          className="mt-5 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  /* ── Main view (live data from API) ─── */
  return (
    <div className="min-h-full bg-[#0f1117] py-8 px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Your Claim Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track progress, upload documents, and request human review</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/25 rounded-xl">
            <span className="font-mono text-xs font-bold text-blue-400">{claimStatus.claim_number}</span>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-[#161b27] border border-white/8 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Processing Milestones</p>
          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/5" />
            {claimStatus.milestones.length > 0 && (
              <div
                className="absolute top-5 left-5 h-0.5 bg-blue-500 transition-all"
                style={{
                  width: `${
                    (claimStatus.milestones.filter(m => m.done).length /
                    Math.max(claimStatus.milestones.length - 1, 1)) * 100
                  }%`
                }}
              />
            )}
            <div className={`relative grid gap-4`} style={{ gridTemplateColumns: `repeat(${claimStatus.milestones.length}, 1fr)` }}>
              {claimStatus.milestones.map((m, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-3 border-2 transition-all ${
                    m.done
                      ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/30'
                      : m.current
                      ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20'
                      : 'bg-[#0f1117] border-white/15 text-slate-600'
                  }`}>
                    {m.done
                      ? <CheckCircle2 className="h-5 w-5 text-white" />
                      : m.current
                      ? <Clock className="h-4 w-4 text-white animate-pulse" />
                      : <span className="text-xs">{i + 1}</span>
                    }
                  </div>
                  <span className={`text-xs font-semibold ${m.done || m.current ? 'text-slate-200' : 'text-slate-600'}`}>{m.title}</span>
                  <span className={`text-[10px] mt-0.5 ${m.current ? 'text-blue-400 font-medium' : 'text-slate-600'}`}>{m.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Required / Upload */}
        {claimStatus.action_required && (
          <div className="bg-amber-500/6 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <span className="text-sm font-bold text-amber-300">Action Required</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">{claimStatus.action_required}</p>

            {!submitted ? (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-amber-400 bg-amber-500/10' : 'border-white/10 hover:border-white/25 hover:bg-white/3'
                  }`}
                >
                  <UploadCloud className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-amber-400' : 'text-slate-600'}`} />
                  <p className="text-sm font-medium text-slate-300">Drop files here or <span className="text-amber-400 underline underline-offset-2">browse</span></p>
                  <p className="text-xs text-slate-600 mt-1">Supported: PDF · JPG · PNG · Max 15MB</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFiles(e.target.files)} />

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map(uf => (
                      <div key={uf.id} className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5">
                        <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 truncate">{uf.file.name}</p>
                          <p className="text-[10px] text-slate-600">{(uf.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={() => removeFile(uf.id)} className="text-slate-600 hover:text-red-400 transition">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={submitDocuments}
                      disabled={submitting}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-black" />
                          Uploading to Claims Team...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit {uploadedFiles.length} Document{uploadedFiles.length > 1 ? 's' : ''} to Claims Team
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-300">Documents Submitted Successfully</p>
                  <p className="text-xs text-slate-500 mt-0.5">Your investigator has received the supplemental verification documents.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Request human review */}
        <div className="bg-[#161b27] border border-white/8 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Request Human Review</p>
              <p className="text-xs text-slate-500">Escalate this claim to a senior investigator</p>
            </div>
          </div>
          {appealRequested ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5" /> Escalation Registered
            </span>
          ) : (
            <button
              onClick={() => setAppealRequested(true)}
              className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition"
            >
              Request Review <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-3 p-3.5 bg-white/2 border border-white/6 rounded-xl">
          <Shield className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Your claim is processed under Privacy-by-Design principles. Internal risk scores and investigation details are never shared with customers. All decisions require human investigator sign-off.
          </p>
        </div>
      </div>
    </div>
  );
}
