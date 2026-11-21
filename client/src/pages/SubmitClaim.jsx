import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Upload, AlertCircle, CheckCircle, Loader, X } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const DOC_TYPES = [
  { value: 'policy', label: 'Insurance Policy Document' },
  { value: 'claim_form', label: 'Claim Form' },
  { value: 'repair_invoice', label: 'Repair Invoice' },
  { value: 'accident_report', label: 'Accident / FIR Report' },
  { value: 'supporting_evidence', label: 'Supporting Evidence / Photos' },
]

export default function SubmitClaim() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [claimId, setClaimId] = useState(null)
  const [uploadedDocs, setUploadedDocs] = useState([])

  const [form, setForm] = useState({
    claimantName: '', policyNumber: '', vehicleRegistration: '',
    accidentDate: '', accidentDescription: '', claimedAmount: '',
    contactPhone: '', contactEmail: ''
  })

  const [files, setFiles] = useState([{ type: '', file: null }])

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmitClaim = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/claims', form)
      setClaimId(res.data.claim._id)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim.')
    } finally { setLoading(false) }
  }

  const addFileRow = () => setFiles(f => [...f, { type: '', file: null }])
  const removeFileRow = (i) => setFiles(f => f.filter((_, idx) => idx !== i))
  const updateFile = (i, key, val) => setFiles(f => f.map((r, idx) => idx === i ? { ...r, [key]: val } : r))

  const handleUploadAll = async () => {
    setError('')
    const validFiles = files.filter(r => r.type && r.file)
    if (validFiles.length === 0) { setError('Add at least one document with a type selected.'); return }
    setLoading(true)
    const uploaded = []
    for (const row of validFiles) {
      const fd = new FormData()
      fd.append('document', row.file)
      fd.append('documentType', row.type)
      try {
        const res = await api.post(`/claims/${claimId}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        uploaded.push(res.data.document)
      } catch (err) {
        setError(`Failed to upload ${row.file.name}: ${err.response?.data?.message || err.message}`)
      }
    }
    setUploadedDocs(uploaded)
    if (uploaded.length > 0) setStep(3)
    setLoading(false)
  }

  if (step === 3) return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="card p-10 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-9 w-9 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Claim Submitted Successfully</h2>
        <p className="text-slate-500 mb-2">{uploadedDocs.length} document(s) uploaded.</p>
        <p className="text-slate-400 text-sm mb-6">The claim will be reviewed by a claims officer. You can track its status in the Claims section.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(`/claims/${claimId}`)} className="btn-primary">View Claim Details</button>
          <button onClick={() => navigate('/claims')} className="btn-secondary">Back to Claims</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Submit Insurance Claim</h1>
        <div className="flex items-center gap-4 mt-4">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
              <span className={`text-sm ${step >= s ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{s === 1 ? 'Claim Details' : 'Upload Documents'}</span>
              {s < 2 && <div className={`w-16 h-0.5 ${step > s ? 'bg-blue-700' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm"><AlertCircle className="h-4 w-4" /> {error}</div>}

      {step === 1 && (
        <div className="card p-6">
          <form onSubmit={handleSubmitClaim} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Claimant Full Name *</label>
                <input value={form.claimantName} onChange={e => updateForm('claimantName', e.target.value)} className="input" placeholder="As on policy document" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Policy Number *</label>
                <input value={form.policyNumber} onChange={e => updateForm('policyNumber', e.target.value.toUpperCase())} className="input font-mono" placeholder="e.g. POL-2024-XXXXX" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Registration *</label>
                <input value={form.vehicleRegistration} onChange={e => updateForm('vehicleRegistration', e.target.value.toUpperCase())} className="input font-mono" placeholder="e.g. MH12AB1234" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Accident Date *</label>
                <input type="date" value={form.accidentDate} onChange={e => updateForm('accidentDate', e.target.value)} className="input" required max={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Claimed Amount (₹) *</label>
                <input type="number" value={form.claimedAmount} onChange={e => updateForm('claimedAmount', e.target.value)} className="input" placeholder="45000" required min="0" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Accident Description *</label>
                <textarea value={form.accidentDescription} onChange={e => updateForm('accidentDescription', e.target.value)} className="input h-28 resize-none" placeholder="Describe the accident clearly: location, circumstances, damage..." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                <input value={form.contactPhone} onChange={e => updateForm('contactPhone', e.target.value)} className="input" placeholder="9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={e => updateForm('contactEmail', e.target.value)} className="input" placeholder="you@example.com" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <><Loader className="h-4 w-4 animate-spin" /> Submitting...</> : 'Submit & Continue →'}
              </button>
              <button type="button" onClick={() => navigate('/claims')} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6">
          <p className="text-sm text-slate-600 mb-5">Upload supporting documents. PDF, JPG, and PNG files accepted (max 10MB each).</p>
          <div className="space-y-4">
            {files.map((row, i) => (
              <div key={i} className="flex gap-3 items-start p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1 space-y-2">
                  <select value={row.type} onChange={e => updateFile(i, 'type', e.target.value)} className="input text-sm">
                    <option value="">Select document type *</option>
                    {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => updateFile(i, 'file', e.target.files[0])}
                    className="block w-full text-sm text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                  {row.file && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {row.file.name} ({(row.file.size / 1024).toFixed(0)} KB)</p>}
                </div>
                {files.length > 1 && <button onClick={() => removeFileRow(i)} className="text-slate-400 hover:text-red-500 mt-1"><X className="h-4 w-4" /></button>}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={addFileRow} className="btn-secondary text-sm flex items-center gap-2"><Upload className="h-4 w-4" /> Add Another File</button>
          </div>
          <div className="flex gap-3 mt-5 pt-5 border-t border-slate-100">
            <button onClick={handleUploadAll} disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><Loader className="h-4 w-4 animate-spin" /> Uploading...</> : 'Upload & Submit →'}
            </button>
            <button onClick={() => setStep(3)} className="btn-secondary text-sm">Skip documents (not recommended)</button>
          </div>
        </div>
      )}
    </div>
  )
}
