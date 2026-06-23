import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'
import api from '../../lib/api'

export default function AiNewsPage() {
  const [news, setNews] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/news', { params: { page, limit: 20 } })
      .then(r => { setNews(r.data.news); setTotalPages(r.data.pages) })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <PublicLayout>
      <SEOHead
        title="AI News Feed"
        description="Curated AI and tech news from around the web. The best stories, hand-picked daily."
      />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 rounded-full bg-highlight ai-pulse" />
            <span className="text-xs text-highlight uppercase tracking-wider font-medium">Live Feed</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-text-main mb-3">
            📡 AI News Feed
          </h1>
          <p className="text-text-muted">
            Hand-curated links to the most important AI and tech stories from across the web. Updated daily.
          </p>
        </div>

        {/* News list */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-surface rounded-xl animate-pulse border border-border-dark" />)}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-4xl mb-3">📡</p>
            <p>No news links yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {news.map(item => (
              <a key={item._id} href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="group block bg-surface border border-border-dark rounded-xl p-5 card-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {item.category && (
                        <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">{item.category}</span>
                      )}
                      {item.sourceName && (
                        <span className="text-xs text-text-muted">{item.sourceName}</span>
                      )}
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">
                        {item.publishedAt ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true }) : ''}
                      </span>
                    </div>
                    <h2 className="font-display font-semibold text-text-main group-hover:text-accent transition-colors mb-2 line-clamp-2">
                      {item.title}
                    </h2>
                    {item.summary && (
                      <p className="text-text-muted text-sm leading-relaxed line-clamp-2">{item.summary}</p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 bg-surface border border-border-dark rounded-lg text-sm text-text-muted hover:text-text-main disabled:opacity-40 transition-colors">
              ← Prev
            </button>
            <span className="text-text-muted text-sm px-3">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 bg-surface border border-border-dark rounded-lg text-sm text-text-muted hover:text-text-main disabled:opacity-40 transition-colors">
              Next →
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
