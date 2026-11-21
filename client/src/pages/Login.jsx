import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, AlertCircle, Loader } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = (role) => {
    const creds = {
      admin: { email: 'admin@claimshield.demo', password: 'Admin@123456' },
      officer: { email: 'officer@claimshield.demo', password: 'Officer@123456' },
      applicant: { email: 'rahul@demo.com', password: 'Demo@123456' }
    }
    setEmail(creds[role].email)
    setPassword(creds[role].password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#1a3a8c] to-[#0ca678] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <Shield className="h-9 w-9 text-teal-300" />
          </div>
          <h1 className="text-3xl font-bold text-white">ClaimShield AI</h1>
          <p className="text-blue-200 mt-1 text-sm">Intelligent Insurance Claims Processing</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign in to your account</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {loading ? <><Loader className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          {/* Demo shortcuts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center mb-3 font-medium uppercase tracking-wide">Demo accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'officer', 'applicant'].map(role => (
                <button key={role} onClick={() => demoLogin(role)} className="text-xs py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 capitalize transition-colors">
                  {role}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">Click a role to auto-fill credentials</p>
          </div>
        </div>

        <p className="text-center text-blue-200 text-xs mt-6">
          Visionet Techthon 2026 · ClaimShield AI · v1.0
        </p>
      </div>
    </div>
  )
}
