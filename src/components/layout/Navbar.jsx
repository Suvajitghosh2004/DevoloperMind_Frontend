import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { name: 'AI', slug: 'artificial-intelligence' },
  { name: 'ML', slug: 'machine-learning' },
  { name: 'Dev Tools', slug: 'developer-tools' },
  { name: 'Startups', slug: 'startups-funding' },
  { name: 'Security', slug: 'cybersecurity' },
  { name: 'Web3', slug: 'web3-blockchain' },
  { name: 'Big Tech', slug: 'big-tech' },
  { name: 'Gadgets', slug: 'gadgets-hardware' },
  { name: 'Open Source', slug: 'open-source' },
  { name: 'Tutorials', slug: 'tutorials' }
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-primary/95 backdrop-blur border-b border-border-dark shadow-lg' : 'bg-primary border-b border-border-dark/50'}`}>
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-highlight flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">DM</span>
          </div>
          <span className="font-display font-bold text-xl text-text-main hidden sm:block">
            Developer<span className="text-accent">Mind</span>
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-surface border border-border-dark rounded-lg py-2 pl-4 pr-10 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Right nav */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/tools" className={({isActive}) => `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-highlight bg-highlight/10' : 'text-text-muted hover:text-text-main'}`}>
            🛠 Tools
          </NavLink>
          <NavLink to="/ai-news" className={({isActive}) => `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-highlight bg-highlight/10' : 'text-text-muted hover:text-text-main'}`}>
            📡 AI News
          </NavLink>
          <NavLink to="/series" className={({isActive}) => `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-highlight bg-highlight/10' : 'text-text-muted hover:text-text-main'}`}>
            📚 Series
          </NavLink>
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-text-muted hover:text-text-main">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Category strip */}
      <div className="border-t border-border-dark/50 overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-2">
          {CATEGORIES.map(cat => (
            <NavLink
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className={({isActive}) => `flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-colors ${isActive ? 'bg-accent text-white' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}
            >
              {cat.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-border-dark">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="mb-3">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-4 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
            </form>
            <div className="flex flex-col gap-1">
              {[{label:'🛠 Tools', to:'/tools'},{label:'📡 AI News', to:'/ai-news'},{label:'📚 Series', to:'/series'}].map(item => (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="py-2 px-3 text-sm text-text-muted hover:text-text-main rounded-lg hover:bg-primary/50">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
