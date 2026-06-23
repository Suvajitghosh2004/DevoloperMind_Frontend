import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function PostCard({ post, featured = false }) {
  if (!post) return null

  return (
    <article className={`group bg-surface border border-border-dark rounded-xl overflow-hidden card-hover ${featured ? 'md:flex gap-6' : ''}`}>
      {/* Thumbnail */}
      <Link to={`/post/${post.slug}`} className={`block overflow-hidden flex-shrink-0 ${featured ? 'md:w-80' : ''}`}>
        <div className={`bg-gradient-to-br from-accent/20 to-highlight/10 ${featured ? 'h-56 md:h-full' : 'h-48'}`}>
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
              {post.category?.name?.includes('AI') ? '🤖' : '💻'}
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          {/* Category + AI badge */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {post.category && (
              <Link
                to={`/category/${post.category.slug}`}
                className="text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
                style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
              >
                {post.category.name}
              </Link>
            )}
            {post.isAIAssisted && (
              <span className="flex items-center gap-1 text-xs text-highlight bg-highlight/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-highlight ai-pulse inline-block" />
                AI-Assisted
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/post/${post.slug}`}>
            <h2 className={`font-display font-bold text-text-main group-hover:text-accent transition-colors line-clamp-2 mb-2 ${featured ? 'text-xl md:text-2xl' : 'text-base'}`}>
              {post.title}
            </h2>
          </Link>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-text-muted text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-text-muted">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt={post.author.name} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-medium">
              {post.author?.name?.[0] || 'D'}
            </div>
          )}
          <span>{post.author?.name || 'DeveloperMind'}</span>
          <span className="text-border-dark">·</span>
          <span>{post.readTime || 5} min read</span>
          <span className="text-border-dark">·</span>
          <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}</span>
        </div>
      </div>
    </article>
  )
}
