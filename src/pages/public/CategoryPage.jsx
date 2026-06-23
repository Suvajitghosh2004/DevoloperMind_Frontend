import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'
import PostCard from '../../components/blog/PostCard'
import api from '../../lib/api'

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/categories/${slug}`).then(r => setCategory(r.data.category)).catch(() => {})
  }, [slug])

  useEffect(() => {
    setLoading(true)
    api.get('/posts', { params: { category: slug, page, limit: 12 } })
      .then(r => { setPosts(r.data.posts); setTotalPages(r.data.pages); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }, [slug, page])

  return (
    <PublicLayout>
      <SEOHead
        title={category?.metaTitle || category?.name}
        description={category?.metaDescription || category?.description}
      />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="mb-10 pb-8 border-b border-border-dark">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color || '#6366F1' }} />
            <span className="text-xs text-text-muted uppercase tracking-wider">Category</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-text-main mb-3">
            {category?.name || slug}
          </h1>
          {category?.description && (
            <p className="text-text-muted text-lg max-w-2xl">{category.description}</p>
          )}
          <p className="text-text-muted text-sm mt-3">{total} article{total !== 1 ? 's' : ''}</p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-xl h-64 animate-pulse border border-border-dark" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-4xl mb-3">📂</p>
            <p>No posts published in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => <PostCard key={post._id} post={post} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
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
