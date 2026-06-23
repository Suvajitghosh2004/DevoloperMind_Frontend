import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import api from '../../lib/api'

const StatCard = ({ label, value, icon, color = 'accent' }) => (
  <div className="bg-surface border border-border-dark rounded-xl p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-text-muted text-sm">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`font-display font-bold text-3xl text-${color}`}>{value?.toLocaleString() ?? '—'}</p>
  </div>
)

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-main">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Welcome back. Here's what's happening.</p>
        </div>
        <Link to="/admin/posts/new"
          className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <span>+</span> New Post
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-surface rounded-xl animate-pulse border border-border-dark" />)}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard label="Published Posts" value={data?.stats.totalPosts} icon="📝" />
            <StatCard label="Total Views" value={data?.stats.totalViews} icon="👁" color="highlight" />
            <StatCard label="Comments" value={data?.stats.totalComments} icon="💬" />
            <StatCard label="Subscribers" value={data?.stats.totalSubscribers} icon="📨" />
            <div className="bg-surface border border-red-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-muted text-sm">Pending</span>
                <span className="text-2xl">⏳</span>
              </div>
              <p className="font-display font-bold text-3xl text-red-400">{data?.stats.pendingComments ?? '—'}</p>
              <Link to="/admin/comments?status=pending" className="text-xs text-text-muted hover:text-accent mt-1 block">
                Review →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top posts */}
            <div className="bg-surface border border-border-dark rounded-xl p-5">
              <h2 className="font-display font-semibold text-text-main mb-4 flex items-center gap-2">
                🔥 Top Posts This Week
              </h2>
              {data?.topPosts?.length === 0 ? (
                <p className="text-text-muted text-sm">No posts yet.</p>
              ) : (
                <ol className="space-y-3">
                  {data?.topPosts?.map((post, i) => (
                    <li key={post._id} className="flex items-center gap-3">
                      <span className="text-xl font-bold text-border-dark font-display w-6 text-center">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <Link to={`/admin/posts/edit/${post._id}`}
                          className="text-sm text-text-main hover:text-accent transition-colors line-clamp-1">
                          {post.title}
                        </Link>
                        <p className="text-xs text-text-muted">{post.views} views</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Recent comments */}
            <div className="bg-surface border border-border-dark rounded-xl p-5">
              <h2 className="font-display font-semibold text-text-main mb-4 flex items-center gap-2">
                💬 Pending Comments
              </h2>
              {data?.recentComments?.length === 0 ? (
                <p className="text-text-muted text-sm">No pending comments. 🎉</p>
              ) : (
                <div className="space-y-3">
                  {data?.recentComments?.map(comment => (
                    <div key={comment._id} className="border border-border-dark rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text-main">{comment.name}</span>
                        <span className="text-xs text-text-muted">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-text-muted text-xs line-clamp-2">{comment.content}</p>
                      {comment.post && (
                        <p className="text-xs text-accent mt-1">on: {comment.post.title}</p>
                      )}
                    </div>
                  ))}
                  <Link to="/admin/comments" className="text-xs text-accent hover:text-highlight block text-center mt-2">
                    View all comments →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
