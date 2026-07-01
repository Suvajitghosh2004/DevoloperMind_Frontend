import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'
import PostCard from '../../components/blog/PostCard'
import NewsletterBanner from '../../components/blog/NewsletterBanner'
import NativeBanner from '../../components/ads/NativeBanner'
import Banner300x250 from '../../components/ads/Banner300x250'
import api from '../../lib/api'

const CATEGORIES = [
  { name: 'All', slug: '' },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
  { name: 'Machine Learning', slug: 'machine-learning' },
  { name: 'Developer Tools', slug: 'developer-tools' },
  { name: 'Startups & Funding', slug: 'startups-funding' },
  { name: 'Cybersecurity', slug: 'cybersecurity' },
  { name: 'Web3 & Blockchain', slug: 'web3-blockchain' },
  { name: 'Big Tech', slug: 'big-tech' },
  { name: 'Gadgets & Hardware', slug: 'gadgets-hardware' },
  { name: 'Open Source', slug: 'open-source' },
  { name: 'Tutorials & How-Tos', slug: 'tutorials' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState(null)
  const [trending, setTrending] = useState([])
  const [posts, setPosts] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/posts/featured').then(r => setFeatured(r.data.post)).catch(() => {})
    api.get('/posts/trending').then(r => setTrending(r.data.posts)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 12 }
    if (activeCategory) params.category = activeCategory
    api.get('/posts', { params })
      .then(r => { setPosts(r.data.posts); setTotalPages(r.data.pages) })
      .finally(() => setLoading(false))
  }, [activeCategory, page])

  const handleCategory = (slug) => {
    setActiveCategory(slug)
    setPage(1)
  }

  return (
    <PublicLayout>
      <SEOHead />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero / Featured */}
        {featured && (
          <section className="mb-12">
            <PostCard post={featured} featured />
          </section>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-1 h-6 bg-gradient-to-b from-accent to-highlight rounded-full" />
              <h2 className="font-display font-bold text-text-main text-lg">🔥 What's Hot in AI This Week</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {trending.map(post => (
                <Link key={post._id} to={`/post/${post.slug}`}
                  className="group bg-surface border border-border-dark rounded-xl p-4 card-hover">
                  {post.category && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block"
                      style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}>
                      {post.category.name}
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-text-main group-hover:text-accent transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-text-muted">{post.views?.toLocaleString()} views</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Native Banner Ad — below trending, above post grid ── */}
        <div className="mb-8 rounded-xl overflow-hidden border border-border-dark/30">
          <p className="text-xs text-text-muted text-right px-2 pt-1 pb-0">Sponsored</p>
          <NativeBanner />
        </div>

        {/* Main content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main posts */}
          <div className="flex-1 min-w-0">
            {/* Category filter */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {CATEGORIES.map(cat => (
                <button key={cat.slug} onClick={() => handleCategory(cat.slug)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    activeCategory === cat.slug
                      ? 'bg-accent text-white'
                      : 'bg-surface text-text-muted hover:text-text-main border border-border-dark'
                  }`}>
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Post grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-surface rounded-xl h-64 animate-pulse border border-border-dark" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-text-muted">
                <p className="text-4xl mb-3">📭</p>
                <p>No posts found in this category yet.</p>
              </div>
            ) : (
              <>
                {/* First 4 posts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {posts.slice(0, 4).map(post => <PostCard key={post._id} post={post} />)}
                </div>

                {/* ── Native Banner between post rows ── */}
                {posts.length > 4 && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-border-dark/30">
                    <p className="text-xs text-text-muted text-right px-2 pt-1 pb-0">Sponsored</p>
                    <NativeBanner />
                  </div>
                )}

                {/* Remaining posts */}
                {posts.length > 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.slice(4).map(post => <PostCard key={post._id} post={post} />)}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
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

          {/* Sidebar */}
          <aside className="lg:w-72 xl:w-80 space-y-6">
            {/* Newsletter CTA */}
            <div className="bg-gradient-to-br from-accent/10 to-highlight/5 border border-accent/20 rounded-xl p-5">
              <h3 className="font-display font-bold text-text-main mb-2">📨 Weekly AI Digest</h3>
              <p className="text-text-muted text-sm mb-4">Every Tuesday — the AI & tech stories that matter.</p>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('newsletter')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="block w-full text-center py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-medium transition-colors">
                Subscribe Free →
              </button>
            </div>

            {/* ── Banner 300x250 Ad in sidebar ── */}
            <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
              <p className="text-xs text-text-muted text-right px-2 pt-1">Sponsored</p>
              <Banner300x250 />
            </div>

            {/* Popular posts */}
            {trending.length > 0 && (
              <div className="bg-surface border border-border-dark rounded-xl p-5">
                <h3 className="font-display font-semibold text-text-main text-sm mb-4">📈 Popular Posts</h3>
                <ol className="space-y-3">
                  {trending.slice(0, 5).map((post, i) => (
                    <li key={post._id} className="flex items-start gap-3">
                      <span className="text-2xl font-bold text-border-dark font-display leading-none mt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <Link to={`/post/${post.slug}`} className="text-sm text-text-muted hover:text-text-main transition-colors line-clamp-2">
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* ── Second Banner 300x250 below popular posts ── */}
            <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
              <p className="text-xs text-text-muted text-right px-2 pt-1">Sponsored</p>
              <Banner300x250 />
            </div>

            {/* Categories */}
            <div className="bg-surface border border-border-dark rounded-xl p-5">
              <h3 className="font-display font-semibold text-text-main text-sm mb-4">🗂 Browse Categories</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.slice(1).map(cat => (
                  <button key={cat.slug} onClick={() => handleCategory(cat.slug)}
                    className="text-xs px-2.5 py-1 bg-primary border border-border-dark rounded-full text-text-muted hover:text-accent hover:border-accent transition-colors">
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Newsletter banner */}
        <div id="newsletter">
          <NewsletterBanner />
        </div>
      </div>
    </PublicLayout>
  )
}