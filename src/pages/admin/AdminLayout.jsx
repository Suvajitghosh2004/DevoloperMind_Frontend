import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../../lib/authStore'

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: '📊', end: true },
  { label: 'Posts', to: '/admin/posts', icon: '📝' },
  { label: 'Categories', to: '/admin/categories', icon: '🗂' },
  { label: 'Comments', to: '/admin/comments', icon: '💬' },
  { label: 'Subscribers', to: '/admin/subscribers', icon: '📨' },
  { label: 'Tools', to: '/admin/tools', icon: '🛠' },
  { label: 'AI News', to: '/admin/news', icon: '📡' },
  { label: 'Series', to: '/admin/series', icon: '📚' },
  { label: 'Media', to: '/admin/media', icon: '🖼' },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border-dark">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-highlight flex items-center justify-center flex-shrink-0">
            <span className="text-white font-display font-bold text-xs">DM</span>
          </div>
          <div>
            <p className="font-display font-bold text-text-main text-sm">DeveloperMind</p>
            <p className="text-text-muted text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-text-muted hover:text-text-main hover:bg-surface'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border-dark">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-text-main text-sm font-medium truncate">{user?.name}</p>
            <p className="text-text-muted text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" className="flex-1 text-center py-1.5 text-xs text-text-muted hover:text-text-main bg-surface rounded-lg border border-border-dark transition-colors">
            View Site
          </a>
          <button onClick={handleLogout} className="flex-1 py-1.5 text-xs text-red-400 hover:text-red-300 bg-surface rounded-lg border border-border-dark transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 bg-surface border-r border-border-dark flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 bg-surface border-r border-border-dark flex flex-col z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border-dark">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-text-muted hover:text-text-main">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-display font-bold text-text-main text-sm">DeveloperMind Admin</span>
          <div className="w-9" />
        </div>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
