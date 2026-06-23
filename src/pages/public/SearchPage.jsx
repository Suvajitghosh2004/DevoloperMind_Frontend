import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'
import PostCard from '../../components/blog/PostCard'
import api from '../../lib/api'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [input, setInput] = useState(query)
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) return
    setLoading(true)
    api.get('/posts', { params: { search: query, limit: 20 } })
      .then(r => { setPosts(r.data.posts); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    if (input.trim()) setSearchParams({ q: input.trim() })
  }

  return (
    <PublicLayout>
      <SEOHead title={query ? `Search: ${query}` : 'Search'} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-text-main mb-6">Search</h1>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Search articles, topics, tools..."
            className="flex-1 bg-surface border border-border-dark rounded-xl py-3 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent" />
          <button type="submit"
            className="bg-accent hover:bg-accent/80 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Search
          </button>
        </form>

        {query && (
          <p className="text-text-muted text-sm mb-6">
            {loading ? 'Searching...' : `${total} result${total !== 1 ? 's' : ''} for "${query}"`}
          </p>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-surface rounded-xl animate-pulse border border-border-dark" />)}
          </div>
        ) : posts.length === 0 && query ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-4xl mb-3">🔍</p>
            <p>No articles found for "{query}"</p>
            <p className="text-sm mt-2">Try different keywords or browse by category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {posts.map(post => <PostCard key={post._id} post={post} />)}
          </div>
        )}

        {!query && (
          <div className="text-center py-20 text-text-muted">
            <p className="text-4xl mb-3">🔍</p>
            <p>Type something to search across all articles</p>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
