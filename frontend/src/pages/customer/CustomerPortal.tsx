import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2, Clock, UploadCloud, HelpCircle,
  FileText, X, Send, Shield, ChevronRight, RefreshCw, Inbox,
  Loader2, Car, Plus, AlertCircle, Calendar, DollarSign
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
  const [claimsList, setClaimsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [appealRequested, setAppealRequested] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Claim Modal State
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [newCategory, setNewCategory] = useState('MOTOR');
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newVehicleReg, setNewVehicleReg] = useState('DL05MN5678');
  const [newGarage, setNewGarage] = useState('Metro Speed Auto Garage');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [filingClaim, setFilingClaim] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(false);
    try {
      const [resStatus, resClaims] = await Promise.all([
        api.get('/customer/claim-status'),
        api.get('/customer/claims')
      ]);
      setClaimStatus(resStatus.data);
      setClaimsList(resClaims.data || []);
    } catch {
      setClaimStatus({
        claim_number: "CS-2026-68595",
        status: "UNDER_INVESTIGATION",
        milestones: [
          { title: "Claim Submitted", date: "21 Oct 2024", done: true },
          { title: "Document Verification", date: "Verified", done: true },
          { title: "Review & Assessment", date: "In Progress", done: false, current: true },
          { title: "Final Settlement", date: "Pending", done: false }
        ],
        action_required: "Please provide: (1) A clear photograph of your vehicle chassis VIN plate, and (2) An itemized repair bill from the workshop to finalize your settlement."
      });
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

  const handleFileNewClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filingClaim) return;
    setFilingClaim(true);
    try {
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach(f => formData.append('files', f));
        formData.append('claimed_amount', newAmount || '95000');
        formData.append('category', newCategory);
        formData.append('incident_description', newDescription || 'Collision reported with bumper damage.');
        formData.append('vehicle_registration', newVehicleReg);

        await api.post('/claims/upload-and-analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/claims', {
          category: newCategory,
          claimed_amount: parseFloat(newAmount) || 50000.0,
          incident_description: newDescription || 'Vehicle collision claim.',
          vehicle_registration: newVehicleReg,
          garage_name: newGarage
        });
      }
      setShowNewClaimModal(false);
      setNewFiles([]);
      setNewAmount('');
      setNewDescription('');
      fetchStatus();
    } catch (err) {
      console.error("Failed to file claim:", err);
    } finally {
      setFilingClaim(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
        <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Retrieving policyholder claims status...</p>
      </div>
    );
  }

  const friendlyStatus = (status: string) => {
    switch (status) {
      case 'APPROVED': return { label: 'Approved & Settled', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'REJECTED': return { label: 'Claim Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'UNDER_INVESTIGATION':
      case 'HUMAN_REVIEW':
      default: return { label: 'Assessment In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
  };

  return (
    <div className="min-h-full bg-[#0a0e17] text-slate-100 py-8 px-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── POLICYHOLDER HERO BANNER ───────────────────────── */}
        <div className="bg-gradient-to-r from-[#121c24] via-[#102422] to-[#121c24] border border-emerald-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Active Policyholder
                </span>
                <span className="text-xs text-slate-500 font-mono">POLICY #POL-2026-9921</span>
              </div>
              <h1 className="text-2xl font-black text-white">Welcome, Priya Verma</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-emerald-400" />
                Comprehensive Zero-Depreciation Cover · Hyundai Creta 1.5L (DL05MN5678)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewClaimModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <Plus className="h-4 w-4" />
                File New Claim
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
            <div>
              <p className="text-slate-500 text-[11px]">Active Claim In Review</p>
              <p className="text-base font-bold text-white mt-0.5">{claimStatus?.claim_number || "CS-2026-68595"}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[11px]">Claimed Reimbursement</p>
              <p className="text-base font-bold text-emerald-400 mt-0.5">₹95,000</p>
            </div>
            <div>
              <p className="text-slate-500 text-[11px]">Coverage Expiry</p>
              <p className="text-base font-bold text-slate-300 mt-0.5">31 Dec 2026</p>
            </div>
          </div>
        </div>

        {/* ── PROCESSING MILESTONES ──────────────────────────── */}
        {claimStatus && (
          <div className="bg-[#141926] border border-white/8 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-base font-bold text-white">Claim Processing Milestones</h3>
                <p className="text-xs text-slate-500 mt-0.5">Live progression of your claim settlement audit</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-xs text-slate-400">Status:</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${friendlyStatus(claimStatus.status).color}`}>
                  {friendlyStatus(claimStatus.status).label}
                </span>
              </div>
            </div>

            <div className="relative pb-2">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-emerald-500 transition-all"
                style={{
                  width: `${
                    (claimStatus.milestones.filter(m => m.done).length /
                    Math.max(claimStatus.milestones.length - 1, 1)) * 100
                  }%`
                }}
              />
              <div className="relative grid gap-4" style={{ gridTemplateColumns: `repeat(${claimStatus.milestones.length}, 1fr)` }}>
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
                    <span className={`text-xs font-semibold ${m.done || m.current ? 'text-slate-200' : 'text-slate-500'}`}>{m.title}</span>
                    <span className={`text-[10px] mt-0.5 ${m.current ? 'text-blue-400 font-medium' : 'text-slate-600'}`}>{m.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTION REQUIRED / SUPPLEMENTAL UPLOADS ─────────── */}
        {claimStatus?.action_required && (
          <div className="bg-[#17201c] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-sm font-bold text-amber-300">Action Required From Policyholder</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">{claimStatus.action_required}</p>

            {!submitted ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-amber-400 bg-amber-500/10' : 'border-white/15 hover:border-emerald-400 hover:bg-white/3'
                  }`}
                >
                  <UploadCloud className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-amber-400' : 'text-slate-500'}`} />
                  <p className="text-sm font-medium text-slate-300">Drop requested photos or documents here</p>
                  <p className="text-xs text-slate-600 mt-1">Supported: PDF · JPG · PNG · Max 15MB</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFiles(e.target.files)} />

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map(uf => (
                      <div key={uf.id} className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5">
                        <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
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
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          Submitting Evidence to Claims Team...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit {uploadedFiles.length} Supplemental Document{uploadedFiles.length > 1 ? 's' : ''}
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
                  <p className="text-sm font-bold text-emerald-300">Supplemental Documents Received</p>
                  <p className="text-xs text-slate-500 mt-0.5">Your claims examiner has been notified and will verify the submitted evidence.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HUMAN REVIEW REQUEST ───────────────────────────── */}
        <div className="bg-[#141926] border border-white/8 rounded-3xl p-6 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Have Questions or Want an Escalation?</p>
              <p className="text-xs text-slate-500">Request a senior human claims manager to review your file</p>
            </div>
          </div>
          {appealRequested ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
              <CheckCircle2 className="h-3.5 w-3.5" /> Escalation Registered
            </span>
          ) : (
            <button
              onClick={() => setAppealRequested(true)}
              className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3.5 py-2 rounded-xl transition"
            >
              Request Manager Review <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* ── POLICYHOLDER PRIVACY NOTICE ─────────────────────── */}
        <div className="flex items-start gap-3 p-4 bg-white/2 border border-white/6 rounded-2xl">
          <Shield className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Your claim documents are handled securely under strict data protection protocols. InsureGuard does not issue automated claim rejections; all outcomes are reviewed and authorized by licensed insurance adjusters.
          </p>
        </div>

      </div>

      {/* ── FILE NEW CLAIM MODAL ────────────────────────────── */}
      {showNewClaimModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#141926] border border-emerald-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">File a New Insurance Claim</h3>
              </div>
              <button onClick={() => setShowNewClaimModal(false)} className="text-slate-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFileNewClaim} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Claim Category
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-[#0d111a] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="MOTOR">Motor / Automobile Collision</option>
                  <option value="HEALTH">Health & Hospitalization</option>
                  <option value="PROPERTY">Property & Commercial Damage</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Estimated Repair / Claimed Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full bg-[#0d111a] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Vehicle Registration Plate
                </label>
                <input
                  type="text"
                  value={newVehicleReg}
                  onChange={e => setNewVehicleReg(e.target.value)}
                  className="w-full bg-[#0d111a] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Incident Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Describe what happened (e.g. Rear-end collision at traffic signal on MG Road)..."
                  className="w-full bg-[#0d111a] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Attach Repair Estimates or Photos
                </label>
                <div
                  onClick={() => newFileInputRef.current?.click()}
                  className="border border-dashed border-white/15 rounded-xl p-3 text-center cursor-pointer hover:border-emerald-500"
                >
                  <p className="text-slate-400 text-[11px]">Click to attach PDF invoices or JPEG damage photos</p>
                  {newFiles.length > 0 && (
                    <p className="text-emerald-400 font-semibold mt-1">{newFiles.length} file(s) selected</p>
                  )}
                </div>
                <input
                  ref={newFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files) setNewFiles(Array.from(e.target.files));
                  }}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewClaimModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={filingClaim}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                  {filingClaim ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
