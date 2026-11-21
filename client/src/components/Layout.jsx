import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, LayoutDashboard, FileText, Plus, LogOut, User } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/claims', label: 'Claims', icon: FileText },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a2a6c] text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-teal-400" />
            <div>
              <p className="font-bold text-lg leading-tight">ClaimShield</p>
              <p className="text-xs text-blue-300">AI Claims Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`
            }>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          {(user?.role === 'officer' || user?.role === 'admin') && (
            <NavLink to="/claims/new" className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-4 ${isActive ? 'bg-teal-600 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`
            }>
              <Plus className="h-4 w-4" /> New Claim
            </NavLink>
          )}
          {user?.role === 'applicant' && (
            <NavLink to="/claims/new" className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-4 ${isActive ? 'bg-teal-600 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`
            }>
              <Plus className="h-4 w-4" /> Submit Claim
            </NavLink>
          )}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-blue-700 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-blue-300 hover:text-white text-sm w-full px-2 py-1.5 rounded hover:bg-blue-800 transition-colors">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
