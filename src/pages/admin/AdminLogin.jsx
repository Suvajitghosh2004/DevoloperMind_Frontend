import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../../lib/authStore'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { login, isLoading, isAuthenticated } = useAuthStore()
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/admin')
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(form.email, form.password)
    if (result.success) navigate('/admin')
    else setError(result.message)
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-highlight flex items-center justify-center">
              <span className="text-white font-display font-bold">DM</span>
            </div>
            <span className="font-display font-bold text-2xl text-text-main">
              Developer<span className="text-accent">Mind</span>
            </span>
          </Link>
          <h1 className="font-display font-bold text-xl text-text-main">Admin Login</h1>
          <p className="text-text-muted text-sm mt-1">Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border-dark rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm text-text-muted mb-1.5 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
              required autoFocus
              className="w-full bg-primary border border-border-dark rounded-xl py-3 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div>
            <label className="text-sm text-text-muted mb-1.5 block">Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
              required
              className="w-full bg-primary border border-border-dark rounded-xl py-3 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/80 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 mt-2">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-text-muted text-xs mt-6">
          Admin account is set via <code className="text-accent">ADMIN_EMAIL</code> /{' '}
          <code className="text-accent">ADMIN_PASSWORD</code> in the server's <code className="text-accent">.env</code> file.
        </p>
      </div>
    </div>
  )
}
