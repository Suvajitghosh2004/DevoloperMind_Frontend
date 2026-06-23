import { useState, useEffect } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'
import ToolCard from '../../components/tools/ToolCard'
import api from '../../lib/api'

const TOOL_CATEGORIES = ['All', 'AI Writing', 'Code Assistant', 'Design', 'Productivity', 'Data', 'DevOps', 'Security', 'Database', 'Cloud', 'Other']

export default function ToolsPage() {
  const [tools, setTools] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = activeCategory !== 'All' ? { category: activeCategory } : {}
    api.get('/tools', { params })
      .then(r => setTools(r.data.tools))
      .finally(() => setLoading(false))
  }, [activeCategory])

  const sponsored = tools.filter(t => t.isSponsored)
  const regular = tools.filter(t => !t.isSponsored)

  return (
    <PublicLayout>
      <SEOHead
        title="AI & Developer Tools Directory"
        description="Curated list of the best AI tools, developer tools, and SaaS products. Find affiliate deals and honest ratings."
      />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs text-highlight bg-highlight/10 border border-highlight/20 px-3 py-1 rounded-full mb-4">
            🛠 Tools Directory
          </span>
          <h1 className="font-display font-bold text-4xl text-text-main mb-4">
            The Best AI & Dev Tools
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Curated tools used by top developers and AI researchers. Honest ratings, real reviews, affiliate links disclosed.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap justify-center mb-10">
          {TOOL_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeCategory === cat
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-muted hover:text-text-main border border-border-dark'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Sponsored */}
        {sponsored.length > 0 && activeCategory === 'All' && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-accent font-medium px-2 py-0.5 bg-accent/10 rounded">Sponsored</span>
              <h2 className="font-display font-semibold text-text-main">Featured Tools</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sponsored.map(tool => <ToolCard key={tool._id} tool={tool} />)}
            </div>
            <div className="border-t border-border-dark mt-10 mb-6" />
          </section>
        )}

        {/* All tools */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-56 bg-surface rounded-xl animate-pulse border border-border-dark" />)}
          </div>
        ) : regular.length === 0 && sponsored.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-4xl mb-3">🛠</p>
            <p>No tools in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {regular.map(tool => <ToolCard key={tool._id} tool={tool} />)}
          </div>
        )}

        {/* Disclosure */}
        <p className="text-center text-text-muted text-xs mt-12">
          Some links are affiliate links. We may earn a commission at no extra cost to you.
          Sponsored placements are clearly marked.
        </p>
      </div>
    </PublicLayout>
  )
}
