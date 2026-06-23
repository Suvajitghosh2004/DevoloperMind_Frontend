import { Link } from 'react-router-dom'

export default function SeriesBanner({ series, posts, currentPostId }) {
  if (!series) return null

  const readPosts = JSON.parse(localStorage.getItem(`series_${series._id}`) || '[]')
  const progress = posts.length > 0 ? Math.round((readPosts.length / posts.length) * 100) : 0

  return (
    <div className="bg-gradient-to-r from-accent/10 to-surface border border-accent/20 rounded-xl p-5 my-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-xs text-accent font-medium uppercase tracking-wider">Part of a series</span>
          <h3 className="font-display font-bold text-text-main mt-1">{series.title}</h3>
          <p className="text-text-muted text-sm mt-1">{series.description}</p>
        </div>
        <Link to={`/series/${series.slug}`} className="flex-shrink-0 text-xs text-accent hover:text-highlight transition-colors">
          View all →
        </Link>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>{readPosts.length}/{posts.length} completed</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-border-dark rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent to-highlight rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Posts list */}
      <ol className="space-y-1.5">
        {posts.map((post, index) => {
          const isRead = readPosts.includes(post._id)
          const isCurrent = post._id === currentPostId
          return (
            <li key={post._id} className="flex items-center gap-2.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                isRead ? 'bg-green-500/20 text-green-400' : isCurrent ? 'bg-accent text-white' : 'bg-border-dark text-text-muted'
              }`}>
                {isRead ? '✓' : index + 1}
              </span>
              {isCurrent ? (
                <span className="text-sm text-text-main font-medium">{post.title}</span>
              ) : (
                <Link to={`/post/${post.slug}`} className="text-sm text-text-muted hover:text-text-main transition-colors">
                  {post.title}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
