import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminComments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') || ''
  const [comments, setComments] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchComments = () => {
    setLoading(true)
    const params = {}
    if (statusFilter) params.status = statusFilter
    api.get('/admin/comments', { params })
      .then(r => { setComments(r.data.comments); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchComments() }, [statusFilter])

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/admin/comments/${id}`, { status })
      toast.success(`Comment ${status}`)
      fetchComments()
    } catch {
      toast.error('Update failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this comment?')) return
    try {
      await api.delete(`/admin/comments/${id}`)
      toast.success('Comment deleted')
      fetchComments()
    } catch {
      toast.error('Delete failed')
    }
  }

  const STATUS_BADGE = {
    pending: 'bg-yellow-500/15 text-yellow-400',
    approved: 'bg-green-500/15 text-green-400',
    rejected: 'bg-red-500/15 text-red-400',
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-text-main mb-1">Comments</h1>
      <p className="text-text-muted text-sm mb-6">{total} total comments</p>

      <div className="flex gap-2 mb-5">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setSearchParams(s ? { status: s } : {})}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === s ? 'bg-accent text-white' : 'bg-surface text-text-muted border border-border-dark hover:text-text-main'
            }`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-text-muted bg-surface border border-border-dark rounded-xl">
          No comments found.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment._id} className="bg-surface border border-border-dark rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-text-main">{comment.name}</span>
                    <span className="text-xs text-text-muted">{comment.email}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[comment.status]}`}>{comment.status}</span>
                  </div>
                  <p className="text-xs text-text-muted">
                    on <span className="text-accent">{comment.post?.title || 'Unknown post'}</span> · {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="text-text-muted text-sm leading-relaxed mb-3">{comment.content}</p>
              <div className="flex gap-2">
                {comment.status !== 'approved' && (
                  <button onClick={() => handleStatus(comment._id, 'approved')}
                    className="text-xs px-3 py-1 bg-green-500/15 text-green-400 rounded-lg hover:bg-green-500/25 transition-colors">
                    Approve
                  </button>
                )}
                {comment.status !== 'rejected' && (
                  <button onClick={() => handleStatus(comment._id, 'rejected')}
                    className="text-xs px-3 py-1 bg-yellow-500/15 text-yellow-400 rounded-lg hover:bg-yellow-500/25 transition-colors">
                    Reject
                  </button>
                )}
                <button onClick={() => handleDelete(comment._id)}
                  className="text-xs px-3 py-1 bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
