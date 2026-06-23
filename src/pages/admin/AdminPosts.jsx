import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminPosts() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchPosts = () => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (statusFilter) params.status = statusFilter
    api.get('/admin/posts', { params })
      .then(r => { setPosts(r.data.posts); setTotal(r.data.total); setTotalPages(r.data.pages) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPosts() }, [page, statusFilter])

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/posts/${id}`)
      toast.success('Post deleted')
      fetchPosts()
    } catch {
      toast.error('Delete failed')
    }
  }

  const STATUS_BADGE = {
    published: 'bg-green-500/15 text-green-400',
    draft: 'bg-yellow-500/15 text-yellow-400',
    scheduled: 'bg-blue-500/15 text-blue-400',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-main">Posts</h1>
          <p className="text-text-muted text-sm mt-0.5">{total} total posts</p>
        </div>
        <Link to="/admin/posts/new" className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + New Post
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {['', 'published', 'draft', 'scheduled'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === s ? 'bg-accent text-white' : 'bg-surface text-text-muted border border-border-dark hover:text-text-main'
            }`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <p className="text-3xl mb-2">📝</p>
            <p>No posts yet. <Link to="/admin/posts/new" className="text-accent">Create your first post →</Link></p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-dark text-left">
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden lg:table-cell">Views</th>
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {posts.map(post => (
                  <tr key={post._id} className="hover:bg-primary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {post.isAIAssisted && (
                          <span className="w-1.5 h-1.5 rounded-full bg-highlight ai-pulse flex-shrink-0" title="AI-Assisted" />
                        )}
                        <span className="text-sm text-text-main font-medium line-clamp-1 max-w-xs">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {post.category && (
                        <span className="text-xs text-text-muted">{post.category.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[post.status] || ''}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted hidden lg:table-cell">
                      {post.views?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted hidden lg:table-cell">
                      {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/posts/edit/${post._id}`}
                          className="text-xs text-accent hover:text-highlight transition-colors">Edit</Link>
                        <a href={`/post/${post.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-text-muted hover:text-text-main transition-colors">View</a>
                        <button onClick={() => handleDelete(post._id, post.title)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 bg-surface border border-border-dark rounded-lg text-xs text-text-muted hover:text-text-main disabled:opacity-40">
            ← Prev
          </button>
          <span className="text-text-muted text-xs">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 bg-surface border border-border-dark rounded-lg text-xs text-text-muted hover:text-text-main disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
