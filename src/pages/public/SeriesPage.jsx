import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'
import api from '../../lib/api'

export default function SeriesPage() {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/series').then(r => setSeries(r.data.series)).finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <SEOHead title="Tutorial Series" description="Deep-dive tutorial series on AI, LangChain, GPT-4, and modern developer tools." />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="font-display font-bold text-4xl text-text-main mb-3">📚 Tutorial Series</h1>
          <p className="text-text-muted text-lg">
            Structured, multi-part guides to help you go from zero to production.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-surface rounded-xl animate-pulse border border-border-dark" />)}
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-4xl mb-3">📚</p>
            <p>No series published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {series.map(s => (
              <Link key={s._id} to={`/series/${s.slug}`}
                className="group bg-surface border border-border-dark rounded-xl overflow-hidden card-hover">
                {s.thumbnail ? (
                  <img src={s.thumbnail} alt={s.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-accent/20 to-highlight/10 flex items-center justify-center text-5xl">📚</div>
                )}
                <div className="p-5">
                  <h2 className="font-display font-bold text-text-main text-lg group-hover:text-accent transition-colors mb-2">
                    {s.title}
                  </h2>
                  {s.description && (
                    <p className="text-text-muted text-sm leading-relaxed line-clamp-2">{s.description}</p>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-accent mt-3">
                    View series →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
