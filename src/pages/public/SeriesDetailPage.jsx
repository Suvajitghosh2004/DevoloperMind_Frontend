import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'
import api from '../../lib/api'

export default function SeriesDetailPage() {
  const { slug } = useParams()
  const [series, setSeries] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/series/${slug}`)
      .then(r => { setSeries(r.data.series); setPosts(r.data.posts) })
      .finally(() => setLoading(false))
  }, [slug])

  const readPosts = series ? JSON.parse(localStorage.getItem(`series_${series._id}`) || '[]') : []

  if (loading) return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-surface rounded mb-4 w-2/3" />
        <div className="h-4 bg-surface rounded w-1/2" />
      </div>
    </PublicLayout>
  )

  if (!series) return (
    <PublicLayout>
      <div className="text-center py-20 text-text-muted">
        <p className="text-4xl mb-3">😕</p>
        <h1 className="font-display text-2xl text-text-main mb-4">Series not found</h1>
        <Link to="/series" className="text-accent hover:text-highlight">← All series</Link>
      </div>
    </PublicLayout>
  )

  const progress = posts.length > 0 ? Math.round((readPosts.length / posts.length) * 100) : 0

  return (
    <PublicLayout>
      <SEOHead title={series.title} description={series.description} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <Link to="/series" className="text-text-muted hover:text-accent text-sm transition-colors mb-6 inline-flex items-center gap-1">
          ← All Series
        </Link>

        {series.thumbnail && (
          <img src={series.thumbnail} alt={series.title} className="w-full h-48 object-cover rounded-xl mb-6" />
        )}

        <h1 className="font-display font-bold text-3xl md:text-4xl text-text-main mb-3">{series.title}</h1>
        {series.description && (
          <p className="text-text-muted text-lg mb-6">{series.description}</p>
        )}

        {/* Progress bar */}
        {posts.length > 0 && (
          <div className="bg-surface border border-border-dark rounded-xl p-5 mb-8">
            <div className="flex justify-between text-sm text-text-muted mb-2">
              <span>Your progress</span>
              <span>{readPosts.length}/{posts.length} articles · {progress}%</span>
            </div>
            <div className="h-2 bg-border-dark rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent to-highlight rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Posts list */}
        <div className="space-y-3">
          {posts.map((post, index) => {
            const isRead = readPosts.includes(post._id)
            return (
              <Link key={post._id} to={`/post/${post.slug}`}
                className="group flex items-center gap-4 bg-surface border border-border-dark rounded-xl p-5 card-hover">
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold font-display flex-shrink-0 ${
                  isRead ? 'bg-green-500/20 text-green-400' : 'bg-accent/10 text-accent'
                }`}>
                  {isRead ? '✓' : index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display font-semibold text-text-main group-hover:text-accent transition-colors line-clamp-1">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-text-muted text-sm line-clamp-1 mt-0.5">{post.excerpt}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs text-text-muted">
                  <span>{post.readTime} min</span>
                  <svg className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <p className="text-3xl mb-2">📝</p>
            <p>No articles published in this series yet.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
