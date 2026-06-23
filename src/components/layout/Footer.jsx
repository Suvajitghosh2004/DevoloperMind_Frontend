import { Link } from 'react-router-dom'
import { useState } from 'react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const { data } = await api.post('/subscribers', { email, source: 'homepage' })
      toast.success(data.message)
      setEmail('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-surface border-t border-border-dark mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-highlight flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">DM</span>
              </div>
              <span className="font-display font-bold text-xl text-text-main">
                Developer<span className="text-accent">Mind</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6 max-w-sm">
              Your weekly digest on AI, developer tools, startups, and the tech shaping tomorrow. Written for builders, by builders.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? '...' : 'Subscribe'}
              </button>
            </form>
            <p className="text-text-muted text-xs mt-2">Every Tuesday. No spam. Unsubscribe anytime.</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-text-main text-sm mb-4">Categories</h4>
            <ul className="space-y-2">
              {['Artificial Intelligence','Machine Learning','Developer Tools','Cybersecurity','Web3 & Blockchain'].map(cat => (
                <li key={cat}>
                  <Link to={`/category/${cat.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}`} className="text-text-muted hover:text-accent text-sm transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-text-main text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              {[{label:'About',to:'/about'},{label:'Contact',to:'/contact'},{label:'Advertise',to:'/advertise'},{label:'Privacy Policy',to:'/privacy'},{label:'AI News Feed',to:'/ai-news'},{label:'Tools Directory',to:'/tools'}].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-text-muted hover:text-accent text-sm transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border-dark mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            © {new Date().getFullYear()} DeveloperMind. Built for developers who build.
          </p>
          <p className="text-text-muted text-xs">
            Some links on this site are affiliate links. We may earn a commission.
          </p>
        </div>
      </div>
    </footer>
  )
}
