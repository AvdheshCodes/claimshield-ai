import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  LayoutDashboard, FileText, Files, Upload, ShieldAlert,
  Share2, MessageSquare, History, Sliders,
  Search, Bell, User as UserIcon, RefreshCw, Download,
  ShieldCheck, Car, CheckCircle2, AlertTriangle, XCircle,
  HelpCircle, ChevronRight, ArrowUpRight, Clock,
  X, Loader2, ArrowRight, LogOut
} from 'lucide-react';
import api from '../../services/api';
import { Claim, User } from '../../types';
import WhySuspiciousView from './WhySuspiciousView';
import RelationshipGraphView from './RelationshipGraphView';
import CopilotChatView from './CopilotChatView';
import DocumentsView from './DocumentsView';
import AdminDashboard from '../admin/AdminDashboard';

interface InvestigatorDashboardProps {
  user?: User | null;
  onLogout?: () => void;
}

type NavSection =
  | 'overview'
  | 'all-claims'
  | 'submit-claim'
  | 'case-details'
  | 'risk-assessment'
  | 'document-verification'
  | 'syndicate-graph'
  | 'investigation-notes'
  | 'audit-trail'
  | 'governance';

type CaseTab = 'validation' | 'risk' | 'documents' | 'graph' | 'copilot' | 'audit';

export default function InvestigatorDashboard({ user, onLogout }: InvestigatorDashboardProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [activeNav, setActiveNav] = useState<NavSection>('overview');
  const [activeCaseTab, setActiveCaseTab] = useState<CaseTab>('validation');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('LAST_30_DAYS');

  // Submit Claim Form State
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [claimantName, setClaimantName] = useState('Priya Verma');
  const [policyNumber, setPolicyNumber] = useState('POL-2026-9921');
  const [vehicleReg, setVehicleReg] = useState('DL05MN5678');
  const [category, setCategory] = useState<'MOTOR' | 'HEALTH' | 'PROPERTY'>('MOTOR');
  const [incidentDate, setIncidentDate] = useState('2024-10-21');
  const [claimedAmount, setClaimedAmount] = useState('95000');
  const [incidentDesc, setIncidentDesc] = useState('Frontal collision damage near MG Road flyover during evening transit.');
  const [garageName, setGarageName] = useState('Metro Speed Auto Garage');
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const formFileInputRef = useRef<HTMLInputElement>(null);

  // Decision Modal State
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFORMATION_REQUIRED'>('APPROVED');
  const [decisionRationale, setDecisionRationale] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [exportingDossier, setExportingDossier] = useState(false);

  useEffect(() => {
    refreshClaims();
  }, []);

  const refreshClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/claims');
      if (res.data && res.data.length > 0) {
        setClaims(res.data);
        if (!selectedClaim) {
          setSelectedClaim(res.data[0]);
        } else {
          const updatedSelected = res.data.find((c: Claim) => c.id === selectedClaim.id);
          if (updatedSelected) setSelectedClaim(updatedSelected);
        }
      } else {
        setClaims([]);
      }
    } catch {
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setActiveNav('case-details');
    setActiveCaseTab('validation');
  };

  const handleFormFileSelect = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter(f =>
      ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
    );
    setFormFiles(prev => [...prev, ...accepted]);
  };

  const removeFormFile = (index: number) => {
    setFormFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleClaimFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submittingClaim) return;
    setSubmittingClaim(true);
    setSubmitSuccess(false);

    try {
      if (formFiles.length > 0) {
        const formData = new FormData();
        formFiles.forEach(f => formData.append('files', f));
        formData.append('claimed_amount', claimedAmount || '95000');
        formData.append('category', category);
        formData.append('incident_description', incidentDesc);
        formData.append('vehicle_registration', vehicleReg);
        formData.append('policy_number', policyNumber);
        formData.append('garage_name', garageName);

        const res = await api.post('/claims/upload-and-analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data) {
          setClaims(prev => [res.data, ...prev]);
          setSelectedClaim(res.data);
          setSubmitSuccess(true);
          setFormFiles([]);
          setTimeout(() => {
            handleInspectClaim(res.data);
          }, 1200);
        }
      } else {
        const res = await api.post('/claims', {
          category,
          claimed_amount: parseFloat(claimedAmount) || 95000.0,
          incident_description: incidentDesc,
          vehicle_registration: vehicleReg,
          garage_name: garageName,
          policy_number: policyNumber
        });
        if (res.data) {
          setClaims(prev => [res.data, ...prev]);
          setSelectedClaim(res.data);
          setSubmitSuccess(true);
          setTimeout(() => {
            handleInspectClaim(res.data);
          }, 1200);
        }
      }
    } catch (err) {
      console.error("Failed to submit claim:", err);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const submitCaseDecision = async () => {
    if (!selectedClaim || !decisionRationale.trim() || submittingDecision) return;
    setSubmittingDecision(true);
    try {
      const res = await api.post(`/claims/${selectedClaim.id}/decision`, {
        decision: decisionType,
        rationale: decisionRationale
      });
      if (res.data?.new_status) {
        const updated = { ...selectedClaim, status: res.data.new_status };
        setSelectedClaim(updated);
        setClaims(prev => prev.map(c => c.id === selectedClaim.id ? updated : c));
        setShowDecisionModal(false);
        setDecisionRationale('');
      }
    } catch (err) {
      console.error("Failed to submit decision:", err);
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleExportDossier = async () => {
    if (!selectedClaim || exportingDossier) return;
    setExportingDossier(true);
    try {
      const res = await api.get(`/claims/${selectedClaim.id}/dossier`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ClaimShield_Dossier_${selectedClaim.claim_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download dossier:", err);
    } finally {
      setExportingDossier(false);
    }
  };

  // KPI Calculations
  const totalClaimsCount = claims.length;
  const pendingReviewCount = claims.filter(c => c.status === 'UNDER_INVESTIGATION' || c.status === 'SUBMITTED' || c.status === 'PENDING').length;
  const highPriorityCount = claims.filter(c => (c.risk_score && c.risk_score >= 60) || c.risk_band === 'VERY_HIGH' || c.risk_band === 'HIGH').length;
  const completedCount = claims.filter(c => c.status === 'APPROVED' || c.status === 'SETTLED' || c.status === 'REJECTED').length;

  // Filtered claims for table
  const filteredClaims = claims.filter(c => {
    const matchesSearch =
      !searchQuery ||
      c.claim_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.vehicle_registration && c.vehicle_registration.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.incident_description && c.incident_description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && (c.status === 'UNDER_INVESTIGATION' || c.status === 'SUBMITTED' || c.status === 'PENDING')) ||
      (statusFilter === 'HIGH_PRIORITY' && ((c.risk_score && c.risk_score >= 60) || c.risk_band === 'VERY_HIGH')) ||
      (statusFilter === 'APPROVED' && (c.status === 'APPROVED' || c.status === 'SETTLED'));

    return matchesSearch && matchesStatus;
  });

  const getRiskBadge = (score?: number, band?: string) => {
    const s = score ?? 0;
    if (s >= 70 || band === 'VERY_HIGH') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FDF2F2] text-[#C44747] border border-[#C44747]/25">High Priority</span>;
    }
    if (s >= 45 || band === 'HIGH') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEF8EC] text-[#C58A27] border border-[#C58A27]/25">Enhanced Review</span>;
    }
    if (s >= 20 || band === 'MEDIUM') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EFF6FC] text-[#3478B8] border border-[#3478B8]/25">Standard Review</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EBF5F0] text-[#25845A] border border-[#25845A]/25">Low Risk</span>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SETTLED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#EBF5F0] text-[#25845A] border border-[#25845A]/20">Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#FDF2F2] text-[#C44747] border border-[#C44747]/20">Rejected</span>;
      case 'UNDER_INVESTIGATION':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#FEF8EC] text-[#C58A27] border border-[#C58A27]/20">In Review</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F6F8] text-[#526477] border border-[#E1E6EB]">{status.replace(/_/g, ' ')}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F6F8] text-[#0D1B2A] overflow-hidden">

      {/* ── 1. INSTITUTIONAL FIXED-WIDTH ENTERPRISE SIDEBAR ───── */}
      <aside className="w-64 shrink-0 bg-[#0D1B2A] text-white flex flex-col justify-between border-r border-[#142B45] select-none z-30">
        <div>
          {/* Brand Area */}
          <div className="px-5 py-4 border-b border-[#142B45] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#245B85] flex items-center justify-center text-white font-bold shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-white leading-none">ClaimShield AI</h2>
              <span className="text-[10px] text-[#718096] block mt-1 leading-none font-medium truncate">
                Insurance Intelligence Platform
              </span>
            </div>
          </div>

          {/* Grouped Navigation */}
          <nav className="p-3 space-y-5 text-xs overflow-y-auto max-h-[calc(100vh-140px)]">

            {/* Group: WORKSPACE */}
            <div>
              <span className="px-3 text-[10px] font-semibold text-[#718096] uppercase tracking-wider block mb-1">
                Workspace
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveNav('overview')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
                    activeNav === 'overview'
                      ? 'bg-[#142B45] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#142B45]/50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveNav('all-claims')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
                    activeNav === 'all-claims'
                      ? 'bg-[#142B45] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#142B45]/50'
                  }`}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span>All Claims</span>
                </button>

                <button
                  onClick={() => setActiveNav('submit-claim')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
                    activeNav === 'submit-claim'
                      ? 'bg-[#142B45] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#142B45]/50'
                  }`}
                >
                  <Upload className="h-4 w-4 shrink-0" />
                  <span>Submit Claim</span>
                </button>

                <button
                  onClick={() => {
                    setActiveNav('case-details');
                    setActiveCaseTab('documents');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
                    activeNav === 'case-details' && activeCaseTab === 'documents'
                      ? 'bg-[#142B45] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#142B45]/50'
                  }`}
                >
                  <Files className="h-4 w-4 shrink-0" />
                  <span>Document Verification</span>
                </button>
              </div>
            </div>

            {/* Group: INTELLIGENCE */}
            <div>
              <span className="px-3 text-[10px] font-semibold text-[#718096] uppercase tracking-wider block mb-1">
                Intelligence
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveNav('case-details');
                    setActiveCaseTab('risk');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
                    activeNav === 'case-details' && activeCaseTab === 'risk'
                      ? 'bg-[#142B45] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#142B45]/50'
                  }`}
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Risk Assessment</span>
                </button>

                <button
                  onClick={() => {
                    setActiveNav('case-details');
                    setActiveCaseTab('graph');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
                    activeNav === 'case-details' && activeCaseTab === 'graph'
                      ? 'bg-[#142B45] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#142B45]/50'
                  }`}
                >
                  <Share2 className="h-4 w-4 shrink-0" />
                  <span>Syndicate Graph</span>
                </button>

                <button
                  onClick={() => {
                    setActiveNav('case-details');
                    setActiveCaseTab('copilot');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
                    activeNav === 'case-details' && activeCaseTab === 'copilot'
                      ? 'bg-[#142B45] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#142B45]/50'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span>Investigation Notes</span>
                </button>
              </div>
            </div>

            {/* Group: MANAGEMENT */}
            <div>
              <span className="px-3 text-[10px] font-semibold text-[#718096] uppercase tracking-wider block mb-1">
                Management
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveNav('case-details');
                    setActiveCaseTab('audit');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
                    activeNav === 'case-details' && activeCaseTab === 'audit'
                      ? 'bg-[#142B45] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#142B45]/50'
                  }`}
                >
                  <History className="h-4 w-4 shrink-0" />
                  <span>Audit Trail</span>
                </button>

                <button
                  onClick={() => setActiveNav('governance')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
                    activeNav === 'governance'
                      ? 'bg-[#142B45] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#142B45]/50'
                  }`}
                >
                  <Sliders className="h-4 w-4 shrink-0" />
                  <span>Governance & Rules</span>
                </button>
              </div>
            </div>

          </nav>
        </div>

        {/* Sidebar Footer: Active Claim Selector Pill */}
        <div className="p-3 border-t border-[#142B45] bg-[#0A1521]">
          {selectedClaim ? (
            <div
              onClick={() => handleInspectClaim(selectedClaim)}
              className="p-2.5 rounded-lg bg-[#142B45]/60 border border-[#245B85]/30 cursor-pointer hover:bg-[#142B45] transition"
            >
              <div className="flex items-center justify-between text-[10px] text-[#718096] mb-1 font-mono">
                <span>ACTIVE CASE</span>
                <span>{selectedClaim.risk_score ?? 0}/100 Risk</span>
              </div>
              <div className="font-mono text-xs font-bold text-white truncate">
                {selectedClaim.claim_number}
              </div>
              <div className="text-[11px] text-[#CBD5E1] truncate mt-0.5">
                {selectedClaim.vehicle_registration || 'DL05MN5678'} · ₹{selectedClaim.claimed_amount.toLocaleString('en-IN')}
              </div>
            </div>
          ) : (
            <div className="text-center py-2 text-[11px] text-[#718096]">
              No active claim selected
            </div>
          )}
        </div>
      </aside>

      {/* ── 2. MAIN APPLICATION CONTENT AREA ───────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── TOP NAVIGATION BAR ──────────────────────────────── */}
        <header className="h-14 bg-white border-b border-[#E1E6EB] px-6 flex items-center justify-between shrink-0 z-20">
          {/* Breadcrumbs & Title */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-[#718096]">ClaimShield AI</span>
            <span className="text-[#CBD5E1]">/</span>
            <span className="font-medium text-[#526477] capitalize">
              {activeNav === 'case-details' ? 'Case Management' : activeNav.replace('-', ' ')}
            </span>
            {activeNav === 'case-details' && selectedClaim && (
              <>
                <span className="text-[#CBD5E1]">/</span>
                <span className="font-mono font-semibold text-[#142B45] bg-[#F4F6F8] px-1.5 py-0.5 rounded border border-[#E1E6EB]">
                  {selectedClaim.claim_number}
                </span>
              </>
            )}
          </div>

          {/* Search, Notifications & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="h-3.5 w-3.5 text-[#718096] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Claim ID, Policy, or Registration..."
                className="w-64 pl-9 pr-3 py-1.5 bg-[#F4F6F8] border border-[#E1E6EB] rounded-lg text-xs text-[#0D1B2A] placeholder-[#718096] focus:outline-none focus:border-[#245B85] transition"
              />
            </div>

            <button
              onClick={refreshClaims}
              className={`p-2 rounded-lg text-[#526477] hover:text-[#0D1B2A] hover:bg-[#F4F6F8] border border-transparent hover:border-[#E1E6EB] transition ${loading ? 'animate-spin' : ''}`}
              title="Refresh queue"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button className="relative p-2 rounded-lg text-[#526477] hover:text-[#0D1B2A] hover:bg-[#F4F6F8] transition">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#C44747] rounded-full" />
            </button>

            <div className="h-4 w-px bg-[#E1E6EB]" />

            {/* Officer Profile Badge & Logout */}
            <div className="flex items-center gap-3 pl-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#142B45] text-white flex items-center justify-center text-xs font-bold">
                  {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AG'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-semibold text-[#0D1B2A] block leading-none">{user?.full_name || 'Avdhesh Ghansela'}</span>
                  <span className="text-[10px] text-[#245B85] font-medium leading-none">{user?.role === 'ADMIN' ? 'Risk Governance Admin' : 'Senior Fraud Examiner'}</span>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-[#526477] hover:text-[#C44747] hover:bg-[#FDF2F2] border border-transparent hover:border-[#C44747]/20 transition"
                  title="Sign out of workspace"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── 3. BODY VIEW ROUTER ─────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ─────────────────────────────────────────────────── */}
          {/* VIEW A: CLAIMS OVERVIEW DASHBOARD (Section 6)      */}
          {/* ─────────────────────────────────────────────────── */}
          {activeNav === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Page Heading & Date Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E6EB]">
                <div>
                  <h1 className="text-xl font-bold text-[#142B45]">Claims Overview</h1>
                  <p className="text-xs text-[#526477] mt-0.5">
                    Monitor claims, verification status, and investigation priorities.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                    className="bg-white border border-[#E1E6EB] text-xs font-medium text-[#526477] px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#245B85]"
                  >
                    <option value="LAST_30_DAYS">Last 30 Days</option>
                    <option value="LAST_90_DAYS">Fiscal Q1 2026</option>
                    <option value="YEAR_TO_DATE">Year to Date (2026)</option>
                  </select>

                  <button
                    onClick={() => setActiveNav('submit-claim')}
                    className="px-3.5 py-1.5 bg-[#142B45] hover:bg-[#0D1B2A] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Intake New Claim
                  </button>
                </div>
              </div>

              {/* 4 Clean KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-[#526477] mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Total Claims</span>
                    <FileText className="h-4 w-4 text-[#245B85]" />
                  </div>
                  <p className="text-2xl font-bold text-[#0D1B2A] tabular-nums font-mono">{totalClaimsCount}</p>
                  <p className="text-[11px] text-[#25845A] mt-1.5 flex items-center gap-1 font-medium">
                    <ArrowUpRight className="h-3 w-3" /> +12.4% vs last cycle
                  </p>
                </div>

                <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-[#526477] mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Pending Review</span>
                    <Clock className="h-4 w-4 text-[#C58A27]" />
                  </div>
                  <p className="text-2xl font-bold text-[#0D1B2A] tabular-nums font-mono">{pendingReviewCount}</p>
                  <p className="text-[11px] text-[#526477] mt-1.5">
                    {((pendingReviewCount / Math.max(totalClaimsCount, 1)) * 100).toFixed(0)}% of intake volume
                  </p>
                </div>

                <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-[#526477] mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">High-Priority Investigations</span>
                    <ShieldAlert className="h-4 w-4 text-[#C44747]" />
                  </div>
                  <p className="text-2xl font-bold text-[#C44747] tabular-nums font-mono">{highPriorityCount}</p>
                  <p className="text-[11px] text-[#C44747] mt-1.5 font-medium">
                    Mandatory human review triggered
                  </p>
                </div>

                <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-[#526477] mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Completed Claims</span>
                    <CheckCircle2 className="h-4 w-4 text-[#25845A]" />
                  </div>
                  <p className="text-2xl font-bold text-[#0D1B2A] tabular-nums font-mono">{completedCount}</p>
                  <p className="text-[11px] text-[#25845A] mt-1.5 font-medium">
                    Settled & audited
                  </p>
                </div>
              </div>

              {/* Analytical Breakdown Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* A. Claims Processing Overview */}
                <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-semibold text-[#526477] uppercase tracking-wider">
                    Processing Overview
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[#0D1B2A] mb-1 font-medium">
                        <span>Under Investigation</span>
                        <span className="tabular-nums font-mono">{pendingReviewCount}</span>
                      </div>
                      <div className="h-2 w-full bg-[#E1E6EB] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C58A27] rounded-full" style={{ width: `${(pendingReviewCount / Math.max(totalClaimsCount, 1)) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#0D1B2A] mb-1 font-medium">
                        <span>Approved & Settled</span>
                        <span className="tabular-nums font-mono">{completedCount}</span>
                      </div>
                      <div className="h-2 w-full bg-[#E1E6EB] rounded-full overflow-hidden">
                        <div className="h-full bg-[#25845A] rounded-full" style={{ width: `${(completedCount / Math.max(totalClaimsCount, 1)) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#0D1B2A] mb-1 font-medium">
                        <span>High-Priority Escalation</span>
                        <span className="tabular-nums font-mono">{highPriorityCount}</span>
                      </div>
                      <div className="h-2 w-full bg-[#E1E6EB] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C44747] rounded-full" style={{ width: `${(highPriorityCount / Math.max(totalClaimsCount, 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Risk Distribution */}
                <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-semibold text-[#526477] uppercase tracking-wider">
                    Risk Distribution
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#EBF5F0] border border-[#25845A]/20 rounded-lg">
                      <span className="text-[11px] font-semibold text-[#25845A]">Low Risk</span>
                      <p className="text-xl font-bold text-[#25845A] tabular-nums font-mono mt-1">
                        {claims.filter(c => !c.risk_score || c.risk_score < 25).length}
                      </p>
                      <span className="text-[10px] text-[#526477]">0 - 24 points</span>
                    </div>

                    <div className="p-3 bg-[#EFF6FC] border border-[#3478B8]/20 rounded-lg">
                      <span className="text-[11px] font-semibold text-[#3478B8]">Standard Review</span>
                      <p className="text-xl font-bold text-[#3478B8] tabular-nums font-mono mt-1">
                        {claims.filter(c => c.risk_score && c.risk_score >= 25 && c.risk_score < 50).length}
                      </p>
                      <span className="text-[10px] text-[#526477]">25 - 49 points</span>
                    </div>

                    <div className="p-3 bg-[#FEF8EC] border border-[#C58A27]/20 rounded-lg">
                      <span className="text-[11px] font-semibold text-[#C58A27]">Enhanced Review</span>
                      <p className="text-xl font-bold text-[#C58A27] tabular-nums font-mono mt-1">
                        {claims.filter(c => c.risk_score && c.risk_score >= 50 && c.risk_score < 70).length}
                      </p>
                      <span className="text-[10px] text-[#526477]">50 - 69 points</span>
                    </div>

                    <div className="p-3 bg-[#FDF2F2] border border-[#C44747]/20 rounded-lg">
                      <span className="text-[11px] font-semibold text-[#C44747]">High Priority</span>
                      <p className="text-xl font-bold text-[#C44747] tabular-nums font-mono mt-1">
                        {claims.filter(c => c.risk_score && c.risk_score >= 70).length}
                      </p>
                      <span className="text-[10px] text-[#526477]">70+ points</span>
                    </div>
                  </div>
                </div>

                {/* C. Quick Action Box */}
                <div className="bg-[#142B45] text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider block mb-1">
                      Platform Assurance
                    </span>
                    <h3 className="text-sm font-bold text-white">IRDAI Underwriting Standard</h3>
                    <p className="text-xs text-[#CBD5E1] mt-2 leading-relaxed">
                      All deterministic fraud assessments require explicit human examiner sign-off. Automated denial without audit justification is strictly prohibited under institutional compliance.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#CBD5E1]">
                    <span>Rules Online: 10 / 10</span>
                    <span className="font-mono text-[#25845A]">● ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Master / Recent Claims Table (Section 7) */}
              <div className="bg-white border border-[#E1E6EB] rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E1E6EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0D1B2A]">Recent Claims Queue</h3>
                    <p className="text-xs text-[#526477] mt-0.5">
                      Select any record to view cross-document reconciliation and fraud indicators.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {['ALL', 'PENDING', 'HIGH_PRIORITY', 'APPROVED'].map(f => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-2.5 py-1 rounded-lg font-medium transition ${
                          statusFilter === f
                            ? 'bg-[#142B45] text-white'
                            : 'bg-[#F4F6F8] text-[#526477] hover:bg-[#E1E6EB]'
                        }`}
                      >
                        {f.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredClaims.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#526477]">
                    No claims match the selected criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E1E6EB] text-[#526477] font-semibold bg-[#F4F6F8]">
                          <th className="py-2.5 px-4">Claim ID</th>
                          <th className="py-2.5 px-3">Claimant</th>
                          <th className="py-2.5 px-3">Vehicle Reg</th>
                          <th className="py-2.5 px-3">Incident Date</th>
                          <th className="py-2.5 px-3 text-right">Claimed Amount</th>
                          <th className="py-2.5 px-3">Risk Category</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E6EB]">
                        {filteredClaims.map(c => (
                          <tr key={c.id} className="hover:bg-[#F4F6F8]/60 transition">
                            <td className="py-3 px-4 font-mono font-semibold text-[#142B45]">
                              {c.claim_number}
                            </td>
                            <td className="py-3 px-3 font-medium text-[#0D1B2A]">
                              {c.claimant_name || 'Priya Verma'}
                            </td>
                            <td className="py-3 px-3 font-mono text-[#526477]">
                              {c.vehicle_registration || 'DL05MN5678'}
                            </td>
                            <td className="py-3 px-3 text-[#526477]">
                              {c.incident_date ? new Date(c.incident_date).toLocaleDateString('en-IN') : '21 Oct 2024'}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-semibold text-[#0D1B2A] tabular-nums">
                              ₹{c.claimed_amount.toLocaleString('en-IN')}.00
                            </td>
                            <td className="py-3 px-3">
                              {getRiskBadge(c.risk_score, c.risk_band)}
                            </td>
                            <td className="py-3 px-3">
                              {getStatusBadge(c.status)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleInspectClaim(c)}
                                className="px-3 py-1 bg-[#EFF6FC] hover:bg-[#DCEBF8] text-[#245B85] border border-[#245B85]/20 rounded-md font-semibold text-xs transition inline-flex items-center gap-1"
                              >
                                <span>Inspect Case</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* VIEW B: ALL CLAIMS MASTER TABLE                    */}
          {/* ─────────────────────────────────────────────────── */}
          {activeNav === 'all-claims' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E6EB]">
                <div>
                  <h1 className="text-xl font-bold text-[#142B45]">All Insurance Claims</h1>
                  <p className="text-xs text-[#526477] mt-0.5">
                    Search and filter institutional claims repository with real-time risk scores.
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('submit-claim')}
                  className="px-3.5 py-1.5 bg-[#142B45] hover:bg-[#0D1B2A] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 self-start sm:self-center"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Intake New Claim
                </button>
              </div>

              {/* Table */}
              <div className="bg-white border border-[#E1E6EB] rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E1E6EB] text-[#526477] font-semibold bg-[#F4F6F8]">
                        <th className="py-2.5 px-4">Claim ID</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Vehicle / Policy</th>
                        <th className="py-2.5 px-3 text-right">Claimed Amount</th>
                        <th className="py-2.5 px-3">Risk Assessment</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-4 text-right">Case Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E6EB]">
                      {filteredClaims.map(c => (
                        <tr key={c.id} className="hover:bg-[#F4F6F8]/60 transition">
                          <td className="py-3 px-4 font-mono font-semibold text-[#142B45]">
                            {c.claim_number}
                          </td>
                          <td className="py-3 px-3 text-[#526477] capitalize">
                            {c.category}
                          </td>
                          <td className="py-3 px-3 font-mono text-[#0D1B2A]">
                            {c.vehicle_registration || 'DL05MN5678'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-[#0D1B2A] tabular-nums">
                            ₹{c.claimed_amount.toLocaleString('en-IN')}.00
                          </td>
                          <td className="py-3 px-3">
                            {getRiskBadge(c.risk_score, c.risk_band)}
                          </td>
                          <td className="py-3 px-3">
                            {getStatusBadge(c.status)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleInspectClaim(c)}
                              className="px-3 py-1 bg-[#142B45] hover:bg-[#0D1B2A] text-white rounded-md font-semibold text-xs transition inline-flex items-center gap-1"
                            >
                              <span>Open File</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* VIEW C: CLAIM SUBMISSION FORM (Section 9)           */}
          {/* ─────────────────────────────────────────────────── */}
          {activeNav === 'submit-claim' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="pb-4 border-b border-[#E1E6EB]">
                <h1 className="text-xl font-bold text-[#142B45]">Institutional Claim Intake Application</h1>
                <p className="text-xs text-[#526477] mt-0.5">
                  Submit policyholder details, accident information, and forensic documents for automated OCR extraction.
                </p>
              </div>

              {submitSuccess && (
                <div className="p-4 bg-[#EBF5F0] border border-[#25845A]/30 rounded-xl flex items-center gap-3 text-xs text-[#25845A]">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="font-semibold block">Claim Successfully Ingested & Analyzed!</span>
                    <span>Opening case investigation file with deterministic fraud indicators...</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleClaimFormSubmit} className="space-y-6">

                {/* Section A: Policyholder Details */}
                <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-semibold text-[#526477] uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4 text-[#245B85]" /> A. Policyholder Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-medium text-[#526477] block mb-1">Claimant Full Name</label>
                      <input
                        type="text"
                        required
                        value={claimantName}
                        onChange={e => setClaimantName(e.target.value)}
                        className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 text-[#0D1B2A] focus:outline-none focus:border-[#245B85]"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-[#526477] block mb-1">Insurance Policy Number</label>
                      <input
                        type="text"
                        required
                        value={policyNumber}
                        onChange={e => setPolicyNumber(e.target.value)}
                        className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 font-mono text-[#0D1B2A] focus:outline-none focus:border-[#245B85]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Vehicle & Asset Details */}
                <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-semibold text-[#526477] uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="h-4 w-4 text-[#245B85]" /> B. Vehicle & Repair Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-medium text-[#526477] block mb-1">Vehicle Registration Number</label>
                      <input
                        type="text"
                        required
                        value={vehicleReg}
                        onChange={e => setVehicleReg(e.target.value)}
                        className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 font-mono text-[#0D1B2A] focus:outline-none focus:border-[#245B85]"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-[#526477] block mb-1">Authorized Repair Garage</label>
                      <input
                        type="text"
                        value={garageName}
                        onChange={e => setGarageName(e.target.value)}
                        className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 text-[#0D1B2A] focus:outline-none focus:border-[#245B85]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C & D: Accident Information & Claim Amount */}
                <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-semibold text-[#526477] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-[#245B85]" /> C. Incident & Financial Parameters
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-medium text-[#526477] block mb-1">Claim Category</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value as any)}
                        className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 text-[#0D1B2A] focus:outline-none focus:border-[#245B85]"
                      >
                        <option value="MOTOR">Motor Automobile</option>
                        <option value="HEALTH">Health Hospitalization</option>
                        <option value="PROPERTY">Property Damage</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-medium text-[#526477] block mb-1">Accident Date</label>
                      <input
                        type="date"
                        required
                        value={incidentDate}
                        onChange={e => setIncidentDate(e.target.value)}
                        className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 text-[#0D1B2A] focus:outline-none focus:border-[#245B85]"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-[#526477] block mb-1">Claimed Amount (INR)</label>
                      <input
                        type="number"
                        required
                        value={claimedAmount}
                        onChange={e => setClaimedAmount(e.target.value)}
                        className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 font-mono text-[#0D1B2A] focus:outline-none focus:border-[#245B85]"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="font-medium text-[#526477] block mb-1">Accident / Incident Summary</label>
                    <textarea
                      rows={3}
                      value={incidentDesc}
                      onChange={e => setIncidentDesc(e.target.value)}
                      className="w-full bg-white border border-[#E1E6EB] rounded-lg px-3 py-2 text-[#0D1B2A] focus:outline-none focus:border-[#245B85] resize-none"
                    />
                  </div>
                </div>

                {/* Section E: Supporting Documents Dropzone */}
                <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-semibold text-[#526477] uppercase tracking-wider flex items-center gap-1.5">
                    <Files className="h-4 w-4 text-[#245B85]" /> E. Supporting Documents Dropzone
                  </h3>

                  <div
                    onClick={() => formFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E1E6EB] hover:border-[#245B85] hover:bg-[#F4F6F8] rounded-xl p-8 text-center cursor-pointer transition"
                  >
                    <Upload className="h-8 w-8 text-[#718096] mx-auto mb-2" />
                    <p className="text-xs font-semibold text-[#0D1B2A]">
                      Click or drag invoices, repair bills, or FIR documents here
                    </p>
                    <p className="text-[11px] text-[#718096] mt-1">
                      Supported Formats: PDF, JPEG, PNG (Up to 15MB each)
                    </p>
                  </div>
                  <input
                    ref={formFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={e => handleFormFileSelect(e.target.files)}
                  />

                  {formFiles.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-medium text-[#526477] block">
                        Files Queued for PyMuPDF OCR Extraction ({formFiles.length}):
                      </span>
                      {formFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-[#F4F6F8] border border-[#E1E6EB] rounded-lg text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 text-[#245B85] shrink-0" />
                            <span className="font-medium text-[#0D1B2A] truncate">{f.name}</span>
                            <span className="text-[#718096] font-mono">({(f.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFormFile(i)}
                            className="text-[#718096] hover:text-[#C44747]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveNav('overview')}
                    className="px-4 py-2 border border-[#E1E6EB] bg-white hover:bg-[#F4F6F8] text-[#526477] text-xs font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingClaim}
                    className="px-5 py-2 bg-[#142B45] hover:bg-[#0D1B2A] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow-sm"
                  >
                    {submittingClaim ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Extracting OCR & Calculating Scores...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Submit Claim & Run 10-Rule Fraud Detection
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* VIEW D: CLAIM DETAILS & CASE MANAGEMENT (Section 8) */}
          {/* ─────────────────────────────────────────────────── */}
          {activeNav === 'case-details' && selectedClaim && (
            <div className="max-w-7xl mx-auto space-y-6">

              {/* ── CASE HEADER BAR ─────────────────────────── */}
              <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E1E6EB]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-base font-bold text-[#142B45]">
                        {selectedClaim.claim_number}
                      </span>
                      {getRiskBadge(selectedClaim.risk_score, selectedClaim.risk_band)}
                      {getStatusBadge(selectedClaim.status)}
                      <span className="text-xs text-[#718096] font-mono">
                        Policy #{selectedClaim.policy_number || 'POL-2026-9921'}
                      </span>
                    </div>
                    <p className="text-xs text-[#526477] max-w-2xl leading-relaxed">
                      {selectedClaim.incident_description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start lg:self-center flex-wrap">
                    <button
                      onClick={handleExportDossier}
                      disabled={exportingDossier}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#F4F6F8] border border-[#E1E6EB] text-[#142B45] text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs"
                      title="Generate court-admissible Investigation Dossier"
                    >
                      {exportingDossier ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#245B85]" />
                      ) : (
                        <Download className="h-3.5 w-3.5 text-[#245B85]" />
                      )}
                      <span>Export Dossier (PDF)</span>
                    </button>

                    <button
                      onClick={() => setShowDecisionModal(true)}
                      className="px-3.5 py-1.5 bg-[#142B45] hover:bg-[#0D1B2A] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-sm"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Record Decision</span>
                    </button>
                  </div>
                </div>

                {/* Sub-header Parameters Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3.5 text-xs">
                  <div>
                    <span className="text-[#718096] text-[11px] block">Claimant</span>
                    <span className="font-medium text-[#0D1B2A] mt-0.5 block">{selectedClaim.claimant_name || 'Priya Verma'}</span>
                  </div>
                  <div>
                    <span className="text-[#718096] text-[11px] block">Vehicle Registration</span>
                    <span className="font-mono font-medium text-[#0D1B2A] mt-0.5 block">{selectedClaim.vehicle_registration || 'DL05MN5678'}</span>
                  </div>
                  <div>
                    <span className="text-[#718096] text-[11px] block">Claimed Amount</span>
                    <span className="font-mono font-bold text-[#0D1B2A] tabular-nums mt-0.5 block">₹{selectedClaim.claimed_amount.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div>
                    <span className="text-[#718096] text-[11px] block">Risk Score</span>
                    <span className="font-mono font-bold text-[#C44747] tabular-nums mt-0.5 block">
                      {selectedClaim.risk_score ?? 0} <span className="text-xs text-[#718096] font-normal">/ 100</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ── CASE NAVIGATION TABS ────────────────────── */}
              <div className="border-b border-[#E1E6EB] flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveCaseTab('validation')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeCaseTab === 'validation'
                      ? 'border-[#245B85] text-[#142B45]'
                      : 'border-transparent text-[#526477] hover:text-[#0D1B2A]'
                  }`}
                >
                  <Files className="h-3.5 w-3.5" />
                  <span>Validation & OCR</span>
                </button>

                <button
                  onClick={() => setActiveCaseTab('risk')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeCaseTab === 'risk'
                      ? 'border-[#245B85] text-[#142B45]'
                      : 'border-transparent text-[#526477] hover:text-[#0D1B2A]'
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Risk Findings ({selectedClaim.findings?.length || 5})</span>
                </button>

                <button
                  onClick={() => setActiveCaseTab('graph')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeCaseTab === 'graph'
                      ? 'border-[#245B85] text-[#142B45]'
                      : 'border-transparent text-[#526477] hover:text-[#0D1B2A]'
                  }`}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Syndicate Network</span>
                </button>

                <button
                  onClick={() => setActiveCaseTab('copilot')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeCaseTab === 'copilot'
                      ? 'border-[#245B85] text-[#142B45]'
                      : 'border-transparent text-[#526477] hover:text-[#0D1B2A]'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Investigation Notes</span>
                </button>

                <button
                  onClick={() => setActiveCaseTab('audit')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeCaseTab === 'audit'
                      ? 'border-[#245B85] text-[#142B45]'
                      : 'border-transparent text-[#526477] hover:text-[#0D1B2A]'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  <span>Audit History</span>
                </button>
              </div>

              {/* ── CASE TAB CONTENT ────────────────────────── */}
              <div>
                {activeCaseTab === 'validation' && (
                  <DocumentsView claim={selectedClaim} />
                )}

                {activeCaseTab === 'risk' && (
                  <WhySuspiciousView
                    claim={selectedClaim}
                    onClaimUpdated={(upd) => {
                      setSelectedClaim(upd);
                      setClaims(prev => prev.map(c => c.id === upd.id ? upd : c));
                    }}
                  />
                )}

                {activeCaseTab === 'documents' && (
                  <DocumentsView claim={selectedClaim} />
                )}

                {activeCaseTab === 'graph' && (
                  <RelationshipGraphView claimNumber={selectedClaim.claim_number} />
                )}

                {activeCaseTab === 'copilot' && (
                  <CopilotChatView claim={selectedClaim} />
                )}

                {activeCaseTab === 'audit' && (
                  <div className="bg-white border border-[#E1E6EB] rounded-xl p-5 shadow-sm space-y-4">
                    <h4 className="text-sm font-semibold text-[#0D1B2A]">Case Audit & Operational Trail</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#E1E6EB] text-[#526477] font-semibold bg-[#F4F6F8]">
                            <th className="py-2.5 px-3">Timestamp</th>
                            <th className="py-2.5 px-3">Actor</th>
                            <th className="py-2.5 px-3">Event Description</th>
                            <th className="py-2.5 px-3">Verification Hash</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E1E6EB]">
                          <tr className="hover:bg-[#F4F6F8]/60 transition">
                            <td className="py-2.5 px-3 font-mono text-[#718096]">Today, 03:45 AM</td>
                            <td className="py-2.5 px-3 font-medium text-[#0D1B2A]">Deterministic Rules Engine</td>
                            <td className="py-2.5 px-3 text-[#526477]">Evaluated 10 fraud rules: Total 80 risk points calculated</td>
                            <td className="py-2.5 px-3 font-mono text-[#718096] text-[10px]">sha256:7b91c...</td>
                          </tr>
                          <tr className="hover:bg-[#F4F6F8]/60 transition">
                            <td className="py-2.5 px-3 font-mono text-[#718096]">Today, 03:44 AM</td>
                            <td className="py-2.5 px-3 font-medium text-[#0D1B2A]">PyMuPDF OCR Subsystem</td>
                            <td className="py-2.5 px-3 text-[#526477]">Extracted raw text from Invoice.pdf and Police_Report.pdf</td>
                            <td className="py-2.5 px-3 font-mono text-[#718096] text-[10px]">sha256:3a41f...</td>
                          </tr>
                          <tr className="hover:bg-[#F4F6F8]/60 transition">
                            <td className="py-2.5 px-3 font-mono text-[#718096]">Today, 03:43 AM</td>
                            <td className="py-2.5 px-3 font-medium text-[#0D1B2A]">Investigator Portal Gateway</td>
                            <td className="py-2.5 px-3 text-[#526477]">Claim dossier created via secure multipart upload</td>
                            <td className="py-2.5 px-3 font-mono text-[#718096] text-[10px]">sha256:1d28e...</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* VIEW E: ADMIN GOVERNANCE VIEW                       */}
          {/* ─────────────────────────────────────────────────── */}
          {activeNav === 'governance' && (
            <AdminDashboard />
          )}

        </main>
      </div>

      {/* ── 4. RECORD CASE DECISION MODAL (Section 8) ─────────── */}
      {showDecisionModal && selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E1E6EB] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E6EB]">
              <div>
                <h3 className="text-sm font-bold text-[#0D1B2A]">Record Case Decision</h3>
                <p className="text-xs text-[#526477] font-mono mt-0.5">{selectedClaim.claim_number} · Risk {selectedClaim.risk_score ?? 0}/100</p>
              </div>
              <button onClick={() => setShowDecisionModal(false)} className="text-[#718096] hover:text-[#0D1B2A]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Decision Select Options */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecisionType('APPROVED')}
                className={`p-3 rounded-lg border text-center transition ${
                  decisionType === 'APPROVED'
                    ? 'bg-[#EBF5F0] border-[#25845A] text-[#25845A]'
                    : 'bg-white border-[#E1E6EB] text-[#526477] hover:border-[#CBD5E1]'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-[#25845A]" />
                <span className="text-xs font-semibold block">Approve</span>
              </button>

              <button
                type="button"
                onClick={() => setDecisionType('ADDITIONAL_INFORMATION_REQUIRED')}
                className={`p-3 rounded-lg border text-center transition ${
                  decisionType === 'ADDITIONAL_INFORMATION_REQUIRED'
                    ? 'bg-[#FEF8EC] border-[#C58A27] text-[#C58A27]'
                    : 'bg-white border-[#E1E6EB] text-[#526477] hover:border-[#CBD5E1]'
                }`}
              >
                <HelpCircle className="h-4 w-4 mx-auto mb-1 text-[#C58A27]" />
                <span className="text-xs font-semibold block">Request Info</span>
              </button>

              <button
                type="button"
                onClick={() => setDecisionType('REJECTED')}
                className={`p-3 rounded-lg border text-center transition ${
                  decisionType === 'REJECTED'
                    ? 'bg-[#FDF2F2] border-[#C44747] text-[#C44747]'
                    : 'bg-white border-[#E1E6EB] text-[#526477] hover:border-[#CBD5E1]'
                }`}
              >
                <XCircle className="h-4 w-4 mx-auto mb-1 text-[#C44747]" />
                <span className="text-xs font-semibold block">Reject</span>
              </button>
            </div>

            {/* Rationale Input */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-[#526477] block">
                Investigator Rationale & Audit Determination (Mandatory)
              </label>
              <textarea
                value={decisionRationale}
                onChange={e => setDecisionRationale(e.target.value)}
                placeholder="State the evidence considered, cross-validation checks performed, and justification for this determination..."
                rows={4}
                className="w-full bg-white border border-[#E1E6EB] rounded-lg p-2.5 text-xs text-[#0D1B2A] placeholder-[#718096] focus:outline-none focus:border-[#245B85] transition"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E1E6EB]">
              <button
                type="button"
                onClick={() => setShowDecisionModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#526477] hover:bg-[#F4F6F8] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCaseDecision}
                disabled={!decisionRationale.trim() || submittingDecision}
                className="px-4 py-1.5 bg-[#142B45] hover:bg-[#0D1B2A] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                {submittingDecision ? 'Logging...' : 'Sign Off & Log Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
