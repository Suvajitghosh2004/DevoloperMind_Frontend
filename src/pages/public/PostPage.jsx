import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'
import ReadingProgress from '../../components/blog/ReadingProgress'
import TableOfContents from '../../components/code/TableOfContents'
import NewsletterBanner from '../../components/blog/NewsletterBanner'
import SeriesBanner from '../../components/series/SeriesBanner'
import PostCard from '../../components/blog/PostCard'
import NativeBanner from '../../components/ads/NativeBanner'
import Banner300x250 from '../../components/ads/Banner300x250'
import api from '../../lib/api'
import toast from 'react-hot-toast'

function cleanPostContent(html, postTitle) {
  if (!html) return html

  const titleEscaped = postTitle?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') || ''
  if (titleEscaped) {
    html = html.replace(
      new RegExp(`^\\s*<h[12][^>]*>\\s*${titleEscaped}\\s*</h[12]>\\s*`, 'i'),
      ''
    )
  }

  html = html.replace(
    /(<img[^>]*>)\s*(<p(?:[^>]*)>)([^<]{1,40})(<\/p>)/g,
    (match, img, pOpen, text, pClose) => {
      const wordCount = text.trim().split(/\s+/).length
      const hasPunctuation = /[.!?,;:]/.test(text)
      if (wordCount <= 5 && !hasPunctuation) {
        return `${img}${pOpen.replace('<p', '<p data-caption="true"')}${text}${pClose}`
      }
      return match
    }
  )

  return html
}

// Split HTML content at roughly the Nth paragraph for mid-article ad insertion
function splitContentAtParagraph(html, n = 3) {
  if (!html) return { before: '', after: '' }
  const parts = html.split(/(?<=<\/p>|<\/h[2-4]>|<\/ul>|<\/ol>)/)
  if (parts.length <= n) return { before: html, after: '' }
  return {
    before: parts.slice(0, n).join(''),
    after: parts.slice(n).join('')
  }
}

const AdLabel = () => (
  <p className="text-xs text-text-muted text-right mb-1">Sponsored</p>
)

export default function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [seriesPosts, setSeriesPosts] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    window.scrollTo(0, 0)
    api.get(`/posts/${slug}`)
      .then(r => {
        setPost(r.data.post)
        setRelated(r.data.related)
        if (r.data.post.series) {
          const seriesId = r.data.post.series._id
          const key = `series_${seriesId}`
          const read = JSON.parse(localStorage.getItem(key) || '[]')
          if (!read.includes(r.data.post._id)) {
            localStorage.setItem(key, JSON.stringify([...read, r.data.post._id]))
          }
          api.get(`/series/${r.data.post.series.slug}`)
            .then(sr => setSeriesPosts(sr.data.posts))
            .catch(() => {})
        }
        return api.get(`/comments/${r.data.post._id}`)
      })
      .then(r => setComments(r.data.comments))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  const submitComment = async (e) => {
    e.preventDefault()
    if (!commentForm.name || !commentForm.email || !commentForm.content) {
      toast.error('All fields required')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/comments', { ...commentForm, post: post._id })
      toast.success('Comment submitted for review!')
      setCommentForm({ name: '', email: '', content: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit comment')
    } finally {
      setSubmitting(false)
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareLinks = [
    { name: 'Twitter/X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post?.title || '')}&url=${encodeURIComponent(shareUrl)}`, icon: '𝕏' },
    { name: 'LinkedIn', href: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, icon: 'in' },
    { name: 'Reddit', href: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post?.title || '')}`, icon: 'r/' },
    { name: 'HN', href: `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(shareUrl)}&t=${encodeURIComponent(post?.title || '')}`, icon: 'Y' },
  ]

  if (loading) return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-surface rounded mb-4 w-3/4" />
        <div className="h-4 bg-surface rounded mb-2 w-1/2" />
        <div className="h-64 bg-surface rounded-xl mb-6" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-surface rounded" />)}
        </div>
      </div>
    </PublicLayout>
  )

  if (!post) return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="font-display text-2xl text-text-main mb-4">Post not found</h1>
        <Link to="/" className="text-accent hover:text-highlight">← Back to home</Link>
      </div>
    </PublicLayout>
  )

  const cleanedContent = cleanPostContent(post.content, post.title)
  // Split after 3rd block for mid-article ad
  const { before: contentBefore, after: contentAfter } = splitContentAtParagraph(cleanedContent, 3)

  return (
    <PublicLayout>
      <ReadingProgress />
      <SEOHead
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        ogImage={post.ogImage || post.thumbnail}
        canonicalUrl={post.canonicalUrl}
        type="article"
        article={{
          publishedAt: post.createdAt,
          updatedAt: post.updatedAt,
          authorName: post.author?.name
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Article */}
          <article className="flex-1 min-w-0" style={{ maxWidth: '720px' }}>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-text-muted mb-6 flex-wrap">
              <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              <span>/</span>
              {post.category && (
                <>
                  <Link to={`/category/${post.category.slug}`} className="hover:text-accent transition-colors">
                    {post.category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-text-main line-clamp-1">{post.title}</span>
            </nav>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {post.category && (
                <Link to={`/category/${post.category.slug}`}
                  className="text-xs font-medium px-3 py-1 rounded-full transition-colors"
                  style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}>
                  {post.category.name}
                </Link>
              )}
              {post.isAIAssisted && (
                <span className="flex items-center gap-1.5 text-xs text-highlight bg-highlight/10 px-3 py-1 rounded-full border border-highlight/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-highlight ai-pulse" />
                  AI-Assisted Content
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display font-bold text-3xl md:text-4xl text-text-main leading-tight mb-5">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-border-dark text-sm text-text-muted">
              <div className="flex items-center gap-2">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                    {post.author?.name?.[0]}
                  </div>
                )}
                <span className="font-medium text-text-main">{post.author?.name}</span>
              </div>
              <span className="text-border-dark">·</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              <span className="text-border-dark">·</span>
              <span>☕ {post.readTime} min read</span>
              <span className="text-border-dark">·</span>
              <span>{post.views?.toLocaleString()} views</span>
            </div>

            {/* Thumbnail */}
            {post.thumbnail && (
              <img src={post.thumbnail} alt={post.title}
                className="w-full rounded-2xl mb-8 object-cover"
                style={{ maxHeight: '420px' }}
                loading="lazy"
              />
            )}

            {/* Series banner */}
            {post.series && seriesPosts.length > 0 && (
              <SeriesBanner series={post.series} posts={seriesPosts} currentPostId={post._id} />
            )}

            {/* ── Article content — BEFORE mid-article ad ── */}
            {contentBefore && (
              <div className="prose-dark" dangerouslySetInnerHTML={{ __html: contentBefore }} />
            )}

            {/* ── Mid-article Ad — Native Banner after intro paragraphs ── */}
            {contentAfter && (
              <div className="my-8 rounded-xl overflow-hidden border border-border-dark/30">
                <AdLabel />
                <NativeBanner />
              </div>
            )}

            {/* ── Article content — AFTER mid-article ad ── */}
            {contentAfter && (
              <div className="prose-dark" dangerouslySetInnerHTML={{ __html: contentAfter }} />
            )}

            {/* If content wasn't split (short post), render it all */}
            {!contentAfter && (
              <div className="prose-dark" dangerouslySetInnerHTML={{ __html: cleanedContent }} />
            )}
{/* ── End of post Native Banner Ad ── */}
<div className="mt-10 rounded-xl overflow-hidden border border-border-dark/30">
  <AdLabel />
  <NativeBanner />
</div>
            {/* Share */}
            <div className="flex items-center gap-3 mt-10 pt-6 border-t border-border-dark">
              <span className="text-sm text-text-muted font-medium">Share:</span>
              {shareLinks.map(link => (
                <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-surface border border-border-dark flex items-center justify-center text-xs font-bold text-text-muted hover:text-text-main hover:border-accent transition-colors">
                  {link.icon}
                </a>
              ))}
            </div>

            {/* Author bio */}
            {post.author && (
              <div className="bg-surface border border-border-dark rounded-2xl p-6 mt-8 flex items-start gap-4">
                {post.author.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name} className="w-14 h-14 rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {post.author.name?.[0]}
                  </div>
                )}
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Written by</p>
                  <h3 className="font-display font-bold text-text-main text-lg">{post.author.name}</h3>
                  {post.author.bio && <p className="text-text-muted text-sm mt-1 leading-relaxed">{post.author.bio}</p>}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <NewsletterBanner variant="inline" />

            {/* Related posts */}
            {related.length > 0 && (
              <section className="mt-10">
                <h3 className="font-display font-bold text-text-main text-xl mb-5">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {related.map(p => <PostCard key={p._id} post={p} />)}
                </div>
              </section>
            )}

            {/* ── Pre-comments Banner Ad ── */}
            <div className="mt-10 rounded-xl overflow-hidden border border-border-dark/30">
              <AdLabel />
              <NativeBanner />
            </div>

            {/* Comments */}
            <section className="mt-8">
              <h3 className="font-display font-bold text-text-main text-xl mb-6">
                💬 Comments ({comments.length})
              </h3>

              <form onSubmit={submitComment} className="bg-surface border border-border-dark rounded-2xl p-6 mb-8">
                <h4 className="font-display font-semibold text-text-main mb-4">Leave a comment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Name *" value={commentForm.name}
                    onChange={e => setCommentForm(f => ({...f, name: e.target.value}))}
                    className="bg-primary border border-border-dark rounded-xl py-2.5 px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
                  <input type="email" placeholder="Email *" value={commentForm.email}
                    onChange={e => setCommentForm(f => ({...f, email: e.target.value}))}
                    className="bg-primary border border-border-dark rounded-xl py-2.5 px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
                </div>
                <textarea placeholder="Your comment..." rows={4} value={commentForm.content}
                  onChange={e => setCommentForm(f => ({...f, content: e.target.value}))}
                  className="w-full bg-primary border border-border-dark rounded-xl py-2.5 px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent resize-none mb-4 transition-colors" />
                <button type="submit" disabled={submitting}
                  className="bg-accent hover:bg-accent/80 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Post Comment'}
                </button>
                <p className="text-text-muted text-xs mt-2">Comments are moderated before appearing.</p>
              </form>

              {comments.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-8">Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map(c => (
                    <div key={c._id} className="bg-surface border border-border-dark rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-text-main">{c.name}</span>
                          <span className="text-xs text-text-muted ml-2">
                            {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <p className="text-text-muted text-sm leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {/* ── End of post Native Banner Ad ── */}
<div className="mt-10 rounded-xl overflow-hidden border border-border-dark/30">
  <AdLabel />
  <NativeBanner />
</div>
            </section>
          </article>

          {/* Sticky sidebar — TOC + Banner ad */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* TOC */}
              {post.tableOfContents?.length > 0 && (
                <TableOfContents items={post.tableOfContents} />
              )}

              {/* ── Sidebar Banner 300x250 Ad ── */}
              <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
                <AdLabel />
                <Banner300x250 />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  )
}