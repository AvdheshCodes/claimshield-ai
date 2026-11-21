import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp, Plus, Loader } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card p-5 flex items-start gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
)

const statusColor = { submitted: 'bg-blue-100 text-blue-700', under_review: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', investigation: 'bg-purple-100 text-purple-700', processing: 'bg-indigo-100 text-indigo-700', additional_info_required: 'bg-orange-100 text-orange-700' }

const RISK_COLORS = { low: '#22c55e', standard: '#eab308', enhanced: '#f97316', high_priority: '#ef4444' }

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [distribution, setDistribution] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/dashboard/summary'), api.get('/dashboard/risk-distribution')])
      .then(([s, d]) => { setSummary(s.data.summary); setDistribution(d.data.distribution) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <Loader className="h-8 w-8 animate-spin text-blue-700" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Claims Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link to="/claims/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Claim
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Claims" value={summary?.total} icon={FileText} color="bg-blue-600" />
        <StatCard label="Pending Review" value={summary?.pending} icon={Clock} color="bg-indigo-500" />
        <StatCard label="High Priority" value={summary?.highPriority} icon={AlertTriangle} color="bg-red-500" sub="Requires investigation" />
        <StatCard label="Approved" value={summary?.approved} icon={CheckCircle} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Risk distribution chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" /> Risk Distribution
          </h3>
          {distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Claims']} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distribution.map((entry) => <Cell key={entry.category} fill={RISK_COLORS[entry.category] || '#6b7280'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No risk data yet. Run risk assessments to see distribution.</div>
          )}
        </div>

        {/* Status summary */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Status Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Under Review', value: summary?.underReview, color: 'bg-yellow-500' },
              { label: 'Investigation', value: summary?.investigation, color: 'bg-purple-500' },
              { label: 'Info Required', value: summary?.infoRequired, color: 'bg-orange-500' },
              { label: 'Rejected', value: summary?.rejected, color: 'bg-red-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${color}`} /> {label}
                </div>
                <span className="font-semibold text-slate-800">{value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent claims */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Recent Claims</h3>
          <Link to="/claims" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Claim #', 'Claimant', 'Amount', 'Risk Score', 'Status', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(summary?.recent || []).map(c => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-blue-700">{c.claimNumber}</td>
                  <td className="px-6 py-4 font-medium">{c.claimantName}</td>
                  <td className="px-6 py-4">₹{c.claimedAmount?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {c.riskScore !== null ? (
                      <span className={`font-bold ${c.riskScore >= 75 ? 'text-red-600' : c.riskScore >= 50 ? 'text-orange-500' : c.riskScore >= 25 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {c.riskScore}/100
                      </span>
                    ) : <span className="text-slate-400 text-xs">Not assessed</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status] || 'bg-slate-100 text-slate-600'}`}>
                      {c.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/claims/${c._id}`} className="text-blue-600 hover:underline text-xs">View →</Link>
                  </td>
                </tr>
              ))}
              {(!summary?.recent || summary.recent.length === 0) && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No claims yet. <Link to="/claims/new" className="text-blue-600 hover:underline">Submit the first claim →</Link></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
