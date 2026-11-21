import React, { useState, useRef } from 'react';
import {
  AlertTriangle, Share2, MessageSquare, RefreshCw,
  FileText, UploadCloud, X, Car, Inbox, Plus
} from 'lucide-react';
import api from '../../services/api';
import { Claim } from '../../types';
import WhySuspiciousView from './WhySuspiciousView';
import RelationshipGraphView from './RelationshipGraphView';
import CopilotChatView from './CopilotChatView';

const RISK_COLOR: Record<string, { bg: string; text: string; border: string; dot: string; bar: string }> = {
  VERY_HIGH: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500', bar: 'bg-red-500' },
  HIGH:      { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-500', bar: 'bg-orange-500' },
  MEDIUM:    { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-500', bar: 'bg-yellow-500' },
  LOW:       { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500', bar: 'bg-emerald-400' },
};

type UploadedFile = { file: File; id: string };

export default function InvestigatorDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [activeTab, setActiveTab] = useState<'why-suspicious' | 'graph' | 'copilot'>('why-suspicious');
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/claims');
      if (res.data?.length > 0) {
        setClaims(res.data);
        setSelectedClaim(res.data[0]);
      } else {
        setClaims([]);
        setSelectedClaim(null);
      }
    } catch {
      setClaims([]);
      setSelectedClaim(null);
    } finally {
      setLoading(false);
    }
  };

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

  const riskColors = selectedClaim?.risk_band ? RISK_COLOR[selectedClaim.risk_band] : RISK_COLOR['LOW'];

  const tabs = [
    { key: 'why-suspicious', label: 'WHY SUSPICIOUS?', icon: AlertTriangle, color: 'text-red-400' },
    { key: 'graph',          label: 'Fraud Graph',      icon: Share2,        color: 'text-blue-400' },
    { key: 'copilot',        label: 'AI Copilot',       icon: MessageSquare, color: 'text-purple-400' },
  ] as const;

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">

      {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-72 shrink-0 bg-[#161b27] border-r border-[#ffffff0f] flex flex-col overflow-hidden">
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3 border-b border-[#ffffff0a]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Queue</span>
            <button
              onClick={refreshClaims}
              className={`p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {claims.length > 0 ? `${claims.length} claim${claims.length !== 1 ? 's' : ''} pending review` : 'No claims loaded'}
          </p>
        </div>

        {/* Claims list or empty state */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1.5">
          {claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <div className="w-12 h-12 rounded-full bg-white/4 border border-white/8 flex items-center justify-center mb-3">
                <Inbox className="h-6 w-6 text-slate-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500">No claims yet</p>
              <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                Connect the backend or submit a claim to see the queue populate.
              </p>
              <button
                onClick={refreshClaims}
                className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          ) : (
            claims.map(claim => {
              const c = RISK_COLOR[claim.risk_band ?? 'LOW'];
              const isSelected = selectedClaim?.id === claim.id;
              return (
                <button
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? `${c.bg} ${c.border} border`
                      : 'border-transparent hover:bg-white/4 hover:border-white/8 border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-blue-400">{claim.claim_number}</span>
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {claim.risk_score}/100
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">₹{claim.claimed_amount.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{claim.incident_description}</p>
                  <div className="mt-2.5 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${claim.risk_score ?? 0}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`text-[9px] uppercase font-bold tracking-wider ${c.text}`}>{claim.risk_band?.replace('_', ' ')}</span>
                    <span className="text-[9px] text-slate-600">{claim.status.replace(/_/g, ' ')}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* ── DOCUMENT UPLOAD PANEL ──────────────────────────── */}
        <div className="border-t border-[#ffffff0a] p-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Upload Evidence</p>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 hover:border-white/25 hover:bg-white/3'
            }`}
          >
            <UploadCloud className={`h-6 w-6 mx-auto mb-1.5 ${isDragging ? 'text-blue-400' : 'text-slate-600'}`} />
            <p className="text-[11px] text-slate-400 font-medium">Drop or click to upload</p>
            <p className="text-[10px] text-slate-600 mt-0.5">PDF · JPG · PNG</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {uploadedFiles.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {uploadedFiles.map(uf => (
                <div key={uf.id} className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-lg px-2.5 py-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="text-[10px] text-slate-300 flex-1 truncate">{uf.file.name}</span>
                  <span className="text-[9px] text-slate-600">{(uf.file.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => removeFile(uf.id)} className="text-slate-600 hover:text-red-400 transition">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button className="w-full mt-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5">
                <UploadCloud className="h-3 w-3" />
                Submit {uploadedFiles.length} File{uploadedFiles.length > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedClaim ? (
          <>
            {/* Claim header bar */}
            <div className="shrink-0 bg-[#161b27] border-b border-[#ffffff0a] px-6 py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-sm font-bold text-white">{selectedClaim.claim_number}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${riskColors.bg} ${riskColors.text} border ${riskColors.border}`}>
                    {selectedClaim.risk_band?.replace('_', ' ')} RISK
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-white/5 text-slate-400 rounded-full border border-white/8">
                    {selectedClaim.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{selectedClaim.incident_description}</p>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-400">
                <div className="text-right">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">Claimed</p>
                  <p className="text-sm font-bold text-white">₹{selectedClaim.claimed_amount.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">Category</p>
                  <p className="text-sm font-bold text-slate-200 flex items-center gap-1"><Car className="h-3.5 w-3.5" />{selectedClaim.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">Risk Score</p>
                  <p className={`text-lg font-black ${riskColors.text}`}>
                    {selectedClaim.risk_score ?? '—'}<span className="text-xs text-slate-600">/100</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="shrink-0 bg-[#13181f] border-b border-[#ffffff0a] flex items-center px-6 gap-1">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === t.key ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <t.icon className={`h-3.5 w-3.5 ${activeTab === t.key ? t.color : ''}`} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'why-suspicious' && <WhySuspiciousView claim={selectedClaim} />}
              {activeTab === 'graph' && <RelationshipGraphView claimNumber={selectedClaim.claim_number} />}
              {activeTab === 'copilot' && <CopilotChatView claim={selectedClaim} />}
            </div>
          </>
        ) : (
          /* Empty workspace */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center mb-5">
              <AlertTriangle className="h-9 w-9 text-slate-700" />
            </div>
            <h2 className="text-lg font-bold text-slate-400 mb-2">No Claim Selected</h2>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              Select a claim from the queue on the left, or connect the backend to load live claims. Use the refresh button to pull from the API.
            </p>
            <button
              onClick={refreshClaims}
              className="mt-5 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition"
            >
              <RefreshCw className="h-4 w-4" /> Load Claims from API
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
