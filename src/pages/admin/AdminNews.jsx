import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Artificial Intelligence', 'Machine Learning', 'Developer Tools', 'Startups & Funding', 'Cybersecurity', 'Web3 & Blockchain', 'Big Tech', 'Gadgets & Hardware', 'Open Source', 'Tutorials & How-Tos']

const EMPTY = { title: '', sourceName: '', sourceUrl: '', summary: '', category: 'Artificial Intelligence', publishedAt: new Date().toISOString().slice(0,10) }

export default function AdminNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const fetchNews = () => {
    setLoading(true)
    api.get('/admin/news').then(r => setNews(r.data.news)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchNews() }, [])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/admin/news/${editing}`, form)
        toast.success('News link updated')
      } else {
        await api.post('/admin/news', form)
        toast.success('News link added')
      }
      setForm(EMPTY)
      setEditing(null)
      setShowForm(false)
      fetchNews()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    }
  }

  const handleEdit = (item) => {
    setForm({
      title: item.title, sourceName: item.sourceName || '', sourceUrl: item.sourceUrl,
      summary: item.summary || '', category: item.category || 'Artificial Intelligence',
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().slice(0,10) : ''
    })
    setEditing(item._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this news link?')) return
    try {
      await api.delete(`/admin/news/${id}`)
      toast.success('Deleted')
      fetchNews()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-main">AI News Feed</h1>
          <p className="text-text-muted text-sm mt-0.5">{news.length} curated links</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY) }}
          className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {showForm ? 'Close' : '+ Add News Link'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border-dark rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-text-muted mb-1.5 block">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-text-muted mb-1.5 block">Source URL *</label>
            <input name="sourceUrl" value={form.sourceUrl} onChange={handleChange} required type="url"
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Source Name</label>
            <input name="sourceName" value={form.sourceName} onChange={handleChange} placeholder="e.g. TechCrunch"
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-text-muted mb-1.5 block">Summary</label>
            <textarea name="summary" value={form.summary} onChange={handleChange} maxLength={400} rows={2}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent resize-none" />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Published Date</label>
            <input type="date" name="publishedAt" value={form.publishedAt} onChange={handleChange}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              {editing ? 'Update' : 'Add Link'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading...</div>
        ) : news.length === 0 ? (
          <div className="p-12 text-center text-text-muted">No news links yet.</div>
        ) : (
          <div className="divide-y divide-border-dark">
            {news.map(item => (
              <div key={item._id} className="p-4 flex items-start justify-between gap-4 hover:bg-primary/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">{item.category}</span>
                    {item.sourceName && <span className="text-xs text-text-muted">{item.sourceName}</span>}
                    <span className="text-xs text-text-muted">
                      {item.publishedAt ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-text-main line-clamp-1">{item.title}</h3>
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-accent truncate block">{item.sourceUrl}</a>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(item)} className="text-xs text-accent hover:text-highlight">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
