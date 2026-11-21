import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle, XCircle, Clock, Loader, ChevronDown, ChevronUp, Zap, MessageSquare, User } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const statusColor = { submitted:'bg-blue-100 text-blue-700', under_review:'bg-yellow-100 text-yellow-700', approved:'bg-green-100 text-green-700', rejected:'bg-red-100 text-red-700', investigation:'bg-purple-100 text-purple-700', processing:'bg-indigo-100 text-indigo-700', additional_info_required:'bg-orange-100 text-orange-700' }
const checkIcon = { pass: <CheckCircle className="h-4 w-4 text-green-500" />, fail: <XCircle className="h-4 w-4 text-red-500" />, warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />, skipped: <Clock className="h-4 w-4 text-slate-400" /> }
const riskColor = (s) => s >= 75 ? 'text-red-600' : s >= 50 ? 'text-orange-500' : s >= 25 ? 'text-yellow-600' : 'text-green-600'
const riskBg = (c) => ({ low:'bg-green-100 text-green-800', standard:'bg-yellow-100 text-yellow-800', enhanced:'bg-orange-100 text-orange-800', high_priority:'bg-red-100 text-red-800' }[c] || 'bg-slate-100 text-slate-700')

export default function ClaimDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isOfficer = user?.role === 'officer' || user?.role === 'admin'

  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [showAudit, setShowAudit] = useState(false)
  const [auditLogs, setAuditLogs] = useState([])
  const [expandedRule, setExpandedRule] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await api.get(`/claims/${id}`)
      setData(res.data)
    } catch { navigate('/claims') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const runAction = async (action, payload = {}) => {
    setActionLoading(action)
    setError('')
    try {
      if (action === 'process_all') {
        for (const doc of data.documents || []) {
          if (doc.processingStatus === 'pending') await api.post(`/documents/${doc._id}/process`)
        }
      } else if (action === 'validate') await api.post(`/claims/${id}/validate`)
      else if (action === 'assess') await api.post(`/claims/${id}/assess-risk`)
      else if (action === 'report') await api.post(`/claims/${id}/generate-report`)
      else if (action === 'status') {
        const { status, notes } = payload
        await api.patch(`/claims/${id}/status`, { status, notes: statusNote || notes })
        setStatusNote('')
      }
      await load()
    } catch (err) { setError(err.response?.data?.message || err.message) }
    finally { setActionLoading('') }
  }

  const loadAudit = async () => {
    if (!showAudit) {
      const res = await api.get(`/claims/${id}/audit-logs`)
      setAuditLogs(res.data.logs)
    }
    setShowAudit(v => !v)
  }

  const { claim, documents = [], riskAssessment, investigationReport } = data

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader className="h-8 w-8 animate-spin text-blue-700" /></div>
  if (!claim) return null

  const riskGaugeData = riskAssessment ? [{ value: riskAssessment.score, fill: riskAssessment.score >= 75 ? '#ef4444' : riskAssessment.score >= 50 ? '#f97316' : riskAssessment.score >= 25 ? '#eab308' : '#22c55e' }] : []

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/claims')} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="h-5 w-5" /></button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800 font-mono">{claim.claimNumber}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[claim.status] || 'bg-slate-100 text-slate-600'}`}>{claim.status?.replace(/_/g, ' ')}</span>
              {claim.riskCategory && <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskBg(claim.riskCategory)}`}>{claim.riskCategory?.replace(/_/g, ' ').toUpperCase()}</span>}
            </div>
            <p className="text-slate-500 text-sm mt-0.5">Submitted {new Date(claim.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm"><AlertTriangle className="h-4 w-4" /> {error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Claim Info */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> Claim Information</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Claimant', claim.claimantName], ['Policy Number', claim.policyNumber],
                ['Vehicle Reg.', claim.vehicleRegistration], ['Accident Date', new Date(claim.accidentDate).toLocaleDateString('en-IN')],
                ['Claimed Amount', `₹${claim.claimedAmount?.toLocaleString()}`], ['Contact', claim.contactPhone || claim.contactEmail || '—']
              ].map(([k, v]) => (
                <div key={k}><p className="text-xs text-slate-400 uppercase tracking-wide">{k}</p><p className="font-medium text-slate-800 font-mono">{v}</p></div>
              ))}
              <div className="col-span-2"><p className="text-xs text-slate-400 uppercase tracking-wide">Description</p><p className="text-slate-700 mt-0.5">{claim.accidentDescription}</p></div>
            </div>
          </div>

          {/* Documents */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-600" /> Documents ({documents.length})</h3>
              {isOfficer && documents.some(d => d.processingStatus === 'pending') && (
                <button onClick={() => runAction('process_all')} disabled={!!actionLoading} className="btn-primary text-xs py-1.5 flex items-center gap-1.5">
                  {actionLoading === 'process_all' ? <Loader className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />} Run OCR on All
                </button>
              )}
            </div>
            {documents.length === 0 ? <p className="text-slate-400 text-sm">No documents uploaded yet.</p> : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc._id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800 text-sm capitalize">{doc.documentType.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{doc.originalName} · {(doc.fileSize / 1024).toFixed(0)} KB</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.processingStatus === 'completed' ? 'bg-green-100 text-green-700' : doc.processingStatus === 'failed' ? 'bg-red-100 text-red-700' : doc.processingStatus === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {doc.processingStatus}
                      </span>
                    </div>
                    {doc.processingStatus === 'completed' && doc.extractedFields && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Extracted Fields</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {Object.entries(doc.extractedFields).filter(([, v]) => v !== null).map(([k, v]) => (
                            <div key={k}><span className="text-xs text-slate-400">{k.replace(/([A-Z])/g, ' $1').trim()}: </span><span className="text-xs font-medium text-slate-700">{String(v)}</span></div>
                          ))}
                        </div>
                        {doc.extractionConfidence !== null && <p className="text-xs text-slate-400 mt-2">Confidence: {Math.round(doc.extractionConfidence * 100)}%{doc.extractionNotes ? ` · ${doc.extractionNotes}` : ''}</p>}
                      </div>
                    )}
                    {doc.processingError && <p className="text-xs text-red-600 mt-2">{doc.processingError}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validation Results */}
          {riskAssessment?.validationResults?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Validation Results</h3>
              <div className="space-y-2">
                {riskAssessment.validationResults.map((r, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${r.status === 'fail' ? 'bg-red-50' : r.status === 'warning' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                    <span className="mt-0.5 flex-shrink-0">{checkIcon[r.status]}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{r.checkName}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{r.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Rules */}
          {riskAssessment?.triggeredRules?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /> Triggered Risk Rules</h3>
              <div className="space-y-3">
                {riskAssessment.triggeredRules.map((rule, i) => (
                  <div key={i} className="border border-red-200 rounded-lg bg-red-50 overflow-hidden">
                    <button onClick={() => setExpandedRule(expandedRule === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-red-200 text-red-800 px-2 py-0.5 rounded">{rule.weight}/100</span>
                        <span className="font-medium text-slate-800 text-sm">{rule.ruleName}</span>
                      </div>
                      {expandedRule === i ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                    </button>
                    {expandedRule === i && (
                      <div className="px-4 pb-4 border-t border-red-200 pt-3 space-y-2 text-sm">
                        <div><span className="text-xs font-semibold text-slate-500">EVIDENCE: </span><span className="text-slate-700">{rule.evidence.explanation}</span></div>
                        <div><span className="text-xs font-semibold text-slate-500">EXPECTED: </span><span className="text-slate-700">{JSON.stringify(rule.evidence.expected)}</span></div>
                        <div><span className="text-xs font-semibold text-slate-500">FOUND: </span><span className="text-slate-700">{JSON.stringify(rule.evidence.found)}</span></div>
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800"><span className="font-semibold">Recommended: </span>{rule.recommendedAction}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Investigation Report */}
          {investigationReport?.status === 'generated' && (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-purple-600" /> AI Investigation Report</h3>
              <p className="text-xs text-slate-400 mb-4">Generated by {investigationReport.generatedBy}</p>
              <div className="prose prose-sm max-w-none">
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {investigationReport.fullReportText}
                </div>
              </div>
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <strong>⚠️ Disclaimer:</strong> This AI-generated summary is a decision-support tool only. It does not constitute a fraud verdict. All final decisions require qualified claims officer review.
              </div>
            </div>
          )}

          {/* Audit Trail */}
          <div className="card overflow-hidden">
            <button onClick={loadAudit} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Clock className="h-4 w-4 text-slate-500" /> Audit Trail</h3>
              {showAudit ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
            </button>
            {showAudit && (
              <div className="px-5 pb-5 border-t border-slate-100">
                {auditLogs.length === 0 ? <p className="text-slate-400 text-sm mt-3">No audit history.</p> : (
                  <div className="mt-3 relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                    <div className="space-y-4">
                      {auditLogs.map((log, i) => (
                        <div key={log._id} className="relative flex items-start gap-4 pl-10">
                          <div className="absolute left-3 top-1 h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-white" />
                          <div>
                            <p className="text-sm font-medium text-slate-800 capitalize">{log.action.replace(/_/g, ' ')}</p>
                            {log.previousStatus && <p className="text-xs text-slate-500">{log.previousStatus} → {log.newStatus}</p>}
                            {log.notes && <p className="text-xs text-slate-600 italic mt-0.5">"{log.notes}"</p>}
                            <p className="text-xs text-slate-400 mt-0.5">{log.performedBy?.name} · {new Date(log.createdAt).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Risk Score */}
          <div className="card p-6 text-center">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 justify-center"><Shield className="h-4 w-4 text-blue-600" /> Risk Score</h3>
            {riskAssessment ? (
              <>
                <div className="relative mx-auto w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" startAngle={90} endAngle={-270} data={riskGaugeData}>
                      <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#f1f5f9' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${riskColor(riskAssessment.score)}`}>{riskAssessment.score}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                </div>
                <div className={`mt-3 inline-flex px-3 py-1 rounded-full text-sm font-semibold ${riskBg(riskAssessment.category)}`}>
                  {riskAssessment.category?.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div><p className="text-green-600 font-bold">{riskAssessment.summary?.passedChecks}</p><p className="text-slate-400">Passed</p></div>
                  <div><p className="text-red-600 font-bold">{riskAssessment.summary?.failedChecks}</p><p className="text-slate-400">Failed</p></div>
                  <div><p className="text-yellow-600 font-bold">{riskAssessment.summary?.warningChecks}</p><p className="text-slate-400">Warnings</p></div>
                </div>
              </>
            ) : (
              <div className="text-slate-400">
                <Shield className="h-16 w-16 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Not assessed yet</p>
              </div>
            )}
          </div>

          {/* Officer Actions */}
          {isOfficer && (
            <div className="card p-5 space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm">Officer Actions</h3>

              {documents.some(d => d.processingStatus === 'pending') && (
                <button onClick={() => runAction('process_all')} disabled={!!actionLoading} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                  {actionLoading === 'process_all' ? <Loader className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} 1. Run OCR
                </button>
              )}

              <button onClick={() => runAction('assess')} disabled={!!actionLoading} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                {actionLoading === 'assess' ? <Loader className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />} 2. Assess Risk
              </button>

              <button onClick={() => runAction('report')} disabled={!!actionLoading || !riskAssessment} className="w-full py-2 text-sm font-medium rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-40 flex items-center justify-center gap-2 transition-colors">
                {actionLoading === 'report' ? <Loader className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />} 3. Generate AI Report
              </button>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-500 mb-2">Update Status</p>
                <textarea value={statusNote} onChange={e => setStatusNote(e.target.value)} placeholder="Add notes (optional)..." className="input text-xs h-16 resize-none mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => runAction('status', { status: 'approved' })} disabled={!!actionLoading} className="py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Approve
                  </button>
                  <button onClick={() => runAction('status', { status: 'rejected' })} disabled={!!actionLoading} className="py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1">
                    <XCircle className="h-3 w-3" /> Reject
                  </button>
                  <button onClick={() => runAction('status', { status: 'investigation' })} disabled={!!actionLoading} className="py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 col-span-2">
                    Send for Investigation
                  </button>
                  <button onClick={() => runAction('status', { status: 'additional_info_required' })} disabled={!!actionLoading} className="py-1.5 text-xs font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 col-span-2">
                    Request Additional Info
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
