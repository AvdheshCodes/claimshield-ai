import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, Loader, ChevronRight } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const statusColor = { submitted: 'bg-blue-100 text-blue-700', under_review: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', investigation: 'bg-purple-100 text-purple-700', processing: 'bg-indigo-100 text-indigo-700', additional_info_required: 'bg-orange-100 text-orange-700', draft: 'bg-slate-100 text-slate-600' }

export default function Claims() {
  const { user } = useAuth()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const fetchClaims = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 15 })
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const res = await api.get(`/claims?${params}`)
      setClaims(res.data.claims)
      setPagination(res.data.pagination)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchClaims() }, [page, status])
  useEffect(() => { const t = setTimeout(fetchClaims, 400); return () => clearTimeout(t) }, [search])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Claims</h1>
          <p className="text-slate-500 text-sm">{pagination.total ?? 0} total claims</p>
        </div>
        <Link to="/claims/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Claim
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search claim #, policy, name..." className="input pl-9" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input w-48">
          <option value="">All statuses</option>
          {['submitted','processing','under_review','approved','rejected','investigation','additional_info_required'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Claim #', 'Claimant', 'Policy', 'Vehicle', 'Claimed', 'Risk', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center"><Loader className="h-6 w-6 animate-spin text-blue-600 mx-auto" /></td></tr>
              ) : claims.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">No claims found.</td></tr>
              ) : claims.map(c => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold whitespace-nowrap">{c.claimNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{c.claimantName}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{c.policyNumber}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{c.vehicleRegistration}</td>
                  <td className="px-4 py-3 text-slate-700">₹{c.claimedAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {c.riskScore !== null ? (
                      <span className={`font-bold text-sm ${c.riskScore >= 75 ? 'text-red-600' : c.riskScore >= 50 ? 'text-orange-500' : c.riskScore >= 25 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {c.riskScore}
                      </span>
                    ) : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status] || 'bg-slate-100 text-slate-600'}`}>
                      {c.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <Link to={`/claims/${c._id}`} className="text-blue-600 hover:text-blue-800">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs py-1 px-3">Previous</button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary text-xs py-1 px-3">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
