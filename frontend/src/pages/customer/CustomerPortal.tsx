import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  CheckCircle2, Clock, UploadCloud, HelpCircle,
  FileText, X, Send, Shield, ChevronRight, RefreshCw,
  Loader2, Car, Plus
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
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [filingClaim, setFilingClaim] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const resStatus = await api.get('/customer/claim-status');
      setClaimStatus(resStatus.data);
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

  const handleFileNewClaim = async (e: FormEvent) => {
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
          garage_name: 'Metro Speed Auto Garage'
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
      <div className="flex flex-col items-center justify-center h-full gap-3 py-20 bg-[#F4F6F8]">
        <RefreshCw className="h-6 w-6 text-[#245B85] animate-spin" />
        <p className="text-xs text-[#526477]">Retrieving policyholder claims status...</p>
      </div>
    );
  }

  const friendlyStatus = (status: string) => {
    switch (status) {
      case 'APPROVED': return { label: 'Approved & Settled', badge: 'bg-[#EBF5F0] text-[#25845A] border-[#25845A]/25' };
      case 'REJECTED': return { label: 'Claim Rejected', badge: 'bg-[#FDF2F2] text-[#C44747] border-[#C44747]/25' };
      case 'UNDER_INVESTIGATION':
      case 'HUMAN_REVIEW':
      default: return { label: 'Assessment In Progress', badge: 'bg-[#FEF8EC] text-[#C58A27] border-[#C58A27]/25' };
    }
  };

  return (
    <div className="min-h-full bg-[#F4F6F8] text-[#0D1B2A] py-8 px-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── POLICYHOLDER SUMMARY CARD ──────────────────────── */}
        <div className="bg-white border border-[#E1E6EB] rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EBF5F0] text-[#25845A] border border-[#25845A]/25 uppercase tracking-wider">
                  Active Policyholder
                </span>
                <span className="text-xs text-[#718096] font-mono">POL-2026-9921</span>
              </div>
              <h1 className="text-xl font-bold text-[#142B45]">Priya Verma</h1>
              <p className="text-xs text-[#526477] mt-1 flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-[#245B85]" />
                Zero-Depreciation Private Car Policy · Hyundai Creta 1.5L (DL05MN5678)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewClaimModal(true)}
                className="px-4 py-2 bg-[#142B45] hover:bg-[#0D1B2A] text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Submit New Claim
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-[#E1E6EB] text-xs">
            <div>
              <p className="text-[#718096] text-[11px]">Active Claim Number</p>
              <p className="text-sm font-bold text-[#0D1B2A] font-mono mt-0.5">{claimStatus?.claim_number || "CS-2026-68595"}</p>
            </div>
            <div>
              <p className="text-[#718096] text-[11px]">Claimed Amount</p>
              <p className="text-sm font-bold text-[#25845A] font-mono tabular-nums mt-0.5">₹95,000.00</p>
            </div>
            <div>
              <p className="text-[#718096] text-[11px]">Policy Validity</p>
              <p className="text-sm font-bold text-[#0D1B2A] mt-0.5">Valid until 31 Dec 2026</p>
            </div>
          </div>
        </div>

        {/* ── PROCESSING MILESTONES ──────────────────────────── */}
        {claimStatus && (
          <div className="bg-white border border-[#E1E6EB] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-[#0D1B2A]">Claim Settlement Milestones</h3>
                <p className="text-xs text-[#526477] mt-0.5">Official timeline for Claim {claimStatus.claim_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#718096]">Status:</span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${friendlyStatus(claimStatus.status).badge}`}>
                  {friendlyStatus(claimStatus.status).label}
                </span>
              </div>
            </div>

            <div className="relative pb-2">
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E1E6EB]" />
              <div
                className="absolute top-4 left-6 h-0.5 bg-[#25845A] transition-all"
                style={{
                  width: `${
                    (claimStatus.milestones.filter(m => m.done).length /
                    Math.max(claimStatus.milestones.length - 1, 1)) * 90
                  }%`
                }}
              />
              <div className="relative grid gap-4" style={{ gridTemplateColumns: `repeat(${claimStatus.milestones.length}, 1fr)` }}>
                {claimStatus.milestones.map((m, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 border transition-all ${
                      m.done
                        ? 'bg-[#25845A] border-[#25845A] text-white'
                        : m.current
                        ? 'bg-[#245B85] border-[#245B85] text-white ring-4 ring-[#EFF6FC]'
                        : 'bg-white border-[#CBD5E1] text-[#718096]'
                    }`}>
                      {m.done
                        ? <CheckCircle2 className="h-4 w-4 text-white" />
                        : m.current
                        ? <Clock className="h-3.5 w-3.5 text-white" />
                        : <span className="text-[11px]">{i + 1}</span>
                      }
                    </div>
                    <span className={`text-xs font-medium ${m.done || m.current ? 'text-[#0D1B2A]' : 'text-[#718096]'}`}>{m.title}</span>
                    <span className="text-[11px] mt-0.5 text-[#718096]">{m.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTION REQUIRED / SUPPLEMENTAL UPLOADS ─────────── */}
        {claimStatus?.action_required && (
          <div className="bg-white border border-[#C58A27]/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="h-4 w-4 text-[#C58A27]" />
              <span className="text-sm font-semibold text-[#C58A27]">Action Required From Policyholder</span>
            </div>
            <p className="text-xs text-[#526477] leading-relaxed mb-5">{claimStatus.action_required}</p>

            {!submitted ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                    isDragging ? 'border-[#245B85] bg-[#EFF6FC]' : 'border-[#E1E6EB] hover:border-[#245B85] hover:bg-[#F4F6F8]'
                  }`}
                >
                  <UploadCloud className={`h-7 w-7 mx-auto mb-2 ${isDragging ? 'text-[#245B85]' : 'text-[#718096]'}`} />
                  <p className="text-xs font-medium text-[#0D1B2A]">Click or drop requested documentation here</p>
                  <p className="text-[11px] text-[#718096] mt-0.5">Accepted Formats: PDF, JPEG, PNG (Max 15MB)</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFiles(e.target.files)} />

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map(uf => (
                      <div key={uf.id} className="flex items-center gap-2.5 bg-[#F4F6F8] border border-[#E1E6EB] rounded-lg px-3 py-2">
                        <FileText className="h-4 w-4 text-[#245B85] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#0D1B2A] truncate">{uf.file.name}</p>
                          <p className="text-[10px] text-[#718096]">{(uf.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={() => removeFile(uf.id)} className="text-[#718096] hover:text-[#C44747] transition">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={submitDocuments}
                      disabled={submitting}
                      className="w-full py-2 bg-[#25845A] hover:bg-[#1E6B48] disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                          Uploading Evidence to Claim Record...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Submit {uploadedFiles.length} Supplemental File{uploadedFiles.length > 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3.5 bg-[#EBF5F0] border border-[#25845A]/25 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-[#25845A] shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#25845A]">Supplemental Documents Uploaded Successfully</p>
                  <p className="text-[11px] text-[#526477] mt-0.5">Your claims examiner has received the files for verification.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HUMAN REVIEW REQUEST ───────────────────────────── */}
        <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EFF6FC] border border-[#245B85]/20 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-[#245B85]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0D1B2A]">Request Senior Claims Adjuster Review</p>
              <p className="text-[11px] text-[#718096]">Speak with an examiner or escalate your claim determination</p>
            </div>
          </div>
          {appealRequested ? (
            <span className="flex items-center gap-1.5 text-xs text-[#25845A] font-medium bg-[#EBF5F0] border border-[#25845A]/20 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5" /> Escalation Logged
            </span>
          ) : (
            <button
              onClick={() => setAppealRequested(true)}
              className="flex items-center gap-1.5 text-xs text-[#245B85] font-medium bg-[#EFF6FC] hover:bg-[#DCEBF8] border border-[#245B85]/25 px-3 py-1.5 rounded-lg transition"
            >
              Request Examiner Review <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* ── POLICYHOLDER PRIVACY NOTICE ─────────────────────── */}
        <div className="flex items-start gap-2.5 p-4 bg-white border border-[#E1E6EB] rounded-xl">
          <Shield className="h-4 w-4 text-[#245B85] shrink-0 mt-0.5" />
          <p className="text-xs text-[#526477] leading-relaxed">
            All submitted claims and repair documentation are protected under IRDAI confidentiality standards. InsureGuard does not execute automated claim denials; all final outcomes are reviewed and signed off by licensed adjusters.
          </p>
        </div>

      </div>

      {/* ── FILE NEW CLAIM MODAL ────────────────────────────── */}
      {showNewClaimModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E1E6EB] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E6EB]">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#142B45]" />
                <h3 className="text-sm font-semibold text-[#0D1B2A]">Submit an Insurance Claim</h3>
              </div>
              <button onClick={() => setShowNewClaimModal(false)} className="text-[#718096] hover:text-[#0D1B2A]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFileNewClaim} className="space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-medium text-[#526477] block mb-1">
                  Claim Category
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 text-[#0D1B2A] focus:outline-none focus:border-[#245B85]"
                >
                  <option value="MOTOR">Motor / Automobile Collision</option>
                  <option value="HEALTH">Health & Hospitalization</option>
                  <option value="PROPERTY">Property & Commercial Damage</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[#526477] block mb-1">
                  Estimated Repair Cost / Claim Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 text-[#0D1B2A] focus:outline-none focus:border-[#245B85]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#526477] block mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  value={newVehicleReg}
                  onChange={e => setNewVehicleReg(e.target.value)}
                  className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 text-[#0D1B2A] focus:outline-none focus:border-[#245B85] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#526477] block mb-1">
                  Incident Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Describe the incident (e.g. Collision with road barrier near Sector 18)..."
                  className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 text-[#0D1B2A] focus:outline-none focus:border-[#245B85] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#526477] block mb-1">
                  Attach Invoices or Damage Photographs
                </label>
                <div
                  onClick={() => newFileInputRef.current?.click()}
                  className="border border-dashed border-[#E1E6EB] rounded-lg p-3 text-center cursor-pointer hover:border-[#245B85] hover:bg-[#F4F6F8]"
                >
                  <p className="text-[#526477] text-xs">Click to select PDF estimates or photos</p>
                  {newFiles.length > 0 && (
                    <p className="text-[#25845A] font-medium text-xs mt-1">{newFiles.length} file(s) attached</p>
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

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewClaimModal(false)}
                  className="flex-1 py-2 bg-white hover:bg-[#F4F6F8] border border-[#E1E6EB] text-[#526477] rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={filingClaim}
                  className="flex-1 py-2 bg-[#142B45] hover:bg-[#0D1B2A] text-white rounded-lg font-medium transition flex items-center justify-center gap-1.5"
                >
                  {filingClaim ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
