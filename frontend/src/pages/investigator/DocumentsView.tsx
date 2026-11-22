import React, { useState, useEffect } from 'react';
import { FileText, ShieldAlert, CheckCircle2, Download, ExternalLink, RefreshCw, Eye, Search, AlertTriangle, Inbox } from 'lucide-react';
import { Claim } from '../../types';
import api from '../../services/api';

interface Props { claim: Claim; }

interface DocumentItem {
  id: string;
  original_filename: string;
  document_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  ocr_status: string;
  has_tampering_indicators: boolean;
  raw_extracted_text?: string;
  extracted_metadata?: Record<string, any>;
  forensic_details?: Record<string, any>;
  file_url: string;
  created_at?: string;
}

export default function DocumentsView({ claim }: Props) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [claim.id]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/claims/${claim.id}/documents`);
      if (res.data && res.data.length > 0) {
        setDocuments(res.data);
        setSelectedDoc(res.data[0]);
      } else {
        setDocuments([]);
        setSelectedDoc(null);
      }
    } catch {
      setDocuments([]);
      setSelectedDoc(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
        <p className="text-sm text-slate-500">Loading document forensic artifacts...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-full bg-white/4 border border-white/8 flex items-center justify-center mb-4">
          <Inbox className="h-7 w-7 text-slate-600" />
        </div>
        <h3 className="text-base font-bold text-slate-400">No Documents Uploaded</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-xs leading-relaxed">
          Upload PDF or image files in the sidebar to view extracted OCR text, entity fields, and forensic metadata.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-400" /> Document Intelligence & OCR Forensics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {documents.length} verified file{documents.length !== 1 ? 's' : ''} with PyMuPDF OCR text extraction & metadata checks
          </p>
        </div>
        <button
          onClick={fetchDocuments}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Grid: Document List on Left, Inspection Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Document Selector Column */}
        <div className="space-y-2">
          {documents.map((doc) => {
            const isSelected = selectedDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-600/10 border-blue-500/30'
                    : 'bg-[#161b27] border-white/6 hover:border-white/12'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className={`h-4 w-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-semibold text-slate-200 truncate">{doc.original_filename}</span>
                  </div>
                  {doc.has_tampering_indicators ? (
                    <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                      FLAGGED
                    </span>
                  ) : (
                    <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      CLEAN
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                  <span className="capitalize">{doc.document_type.replace(/_/g, ' ')}</span>
                  <span>{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inspection Details Panel (Span 2) */}
        {selectedDoc && (
          <div className="lg:col-span-2 space-y-3">
            {/* Metadata Card */}
            <div className="bg-[#161b27] border border-white/8 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{selectedDoc.original_filename}</h4>
                  <p className="text-[10px] font-mono text-slate-600 truncate mt-0.5">SHA-256: {selectedDoc.sha256_hash}</p>
                </div>
                <a
                  href={selectedDoc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg transition"
                >
                  <ExternalLink className="h-3 w-3" /> View Original
                </a>
              </div>

              {/* Forensic Status */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                selectedDoc.has_tampering_indicators
                  ? 'bg-red-500/10 border-red-500/25 text-red-300'
                  : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              }`}>
                {selectedDoc.has_tampering_indicators ? (
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs leading-relaxed">
                  <span className="font-bold">
                    {selectedDoc.has_tampering_indicators ? 'Forensic Alert: ' : 'Integrity Verified: '}
                  </span>
                  {selectedDoc.has_tampering_indicators
                    ? (selectedDoc.forensic_details?.suspicious_metadata_flags?.join('; ') || 'Graphic manipulation markers detected.')
                    : 'No unauthorized graphic editor metadata or compression anomalies found.'}
                </div>
              </div>

              {/* Extracted Key-Value Entities */}
              {selectedDoc.extracted_metadata && Object.keys(selectedDoc.extracted_metadata).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Parsed Insurance Entities</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(selectedDoc.extracted_metadata).map(([key, val]) => (
                      <div key={key} className="bg-[#0f1117] border border-white/6 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">{key}</span>
                        <span className="font-semibold text-slate-200 mt-0.5 block truncate">
                          {typeof val === 'number' ? `₹${val.toLocaleString('en-IN')}` : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Raw Extracted Text Viewer */}
            <div className="bg-[#161b27] border border-white/8 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  PyMuPDF OCR Extracted Text
                </p>
                <span className="text-[10px] text-slate-600 font-mono">Status: {selectedDoc.ocr_status}</span>
              </div>
              <div className="bg-[#0f1117] border border-white/6 rounded-xl p-3 max-h-60 overflow-y-auto">
                <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedDoc.raw_extracted_text || 'No text extracted.'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
