import { useState, useEffect } from 'react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['AI Writing', 'Code Assistant', 'Design', 'Productivity', 'Data', 'DevOps', 'Security', 'Database', 'Cloud', 'Other']

const EMPTY = { name: '', logo: '', description: '', category: 'AI Writing', affiliateUrl: '', websiteUrl: '', rating: 5, badge: '', isSponsored: false, isActive: true }

export default function AdminTools() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const fetchTools = () => {
    setLoading(true)
    api.get('/admin/tools').then(r => setTools(r.data.tools)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchTools() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/admin/tools/${editing}`, form)
        toast.success('Tool updated')
      } else {
        await api.post('/admin/tools', form)
        toast.success('Tool created')
      }
      setForm(EMPTY)
      setEditing(null)
      setShowForm(false)
      fetchTools()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    }
  }

  const handleEdit = (tool) => {
    setForm({
      name: tool.name, logo: tool.logo || '', description: tool.description || '',
      category: tool.category || 'AI Writing', affiliateUrl: tool.affiliateUrl || '',
      websiteUrl: tool.websiteUrl || '', rating: tool.rating || 5, badge: tool.badge || '',
      isSponsored: tool.isSponsored, isActive: tool.isActive
    })
    setEditing(tool._id)
    setShowForm(true)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete tool "${name}"?`)) return
    try {
      await api.delete(`/admin/tools/${id}`)
      toast.success('Tool deleted')
      fetchTools()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-main">Tools Directory</h1>
          <p className="text-text-muted text-sm mt-0.5">{tools.length} tools listed</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY) }}
          className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {showForm ? 'Close' : '+ Add Tool'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border-dark rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Logo URL</label>
            <input name="logo" value={form.logo} onChange={handleChange}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-text-muted mb-1.5 block">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} maxLength={300} rows={2}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent resize-none" />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Rating (1-5)</label>
            <input type="number" name="rating" value={form.rating} onChange={handleChange} min={1} max={5} step={0.1}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Affiliate URL</label>
            <input name="affiliateUrl" value={form.affiliateUrl} onChange={handleChange}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Website URL (fallback)</label>
            <input name="websiteUrl" value={form.websiteUrl} onChange={handleChange}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Badge (e.g. "Free Tier Available")</label>
            <input name="badge" value={form.badge} onChange={handleChange}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
              <input type="checkbox" name="isSponsored" checked={form.isSponsored} onChange={handleChange} className="w-4 h-4 accent-accent" />
              Sponsored
            </label>
            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-accent" />
              Active
            </label>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              {editing ? 'Update Tool' : 'Create Tool'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading...</div>
        ) : tools.length === 0 ? (
          <div className="p-12 text-center text-text-muted">No tools yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-dark text-left">
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Tool</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Category</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Rating</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {tools.map(tool => (
                <tr key={tool._id} className="hover:bg-primary/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-text-main font-medium">{tool.name}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{tool.category}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">⭐ {tool.rating}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {tool.isSponsored && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent">Sponsored</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${tool.isActive ? 'bg-green-500/15 text-green-400' : 'bg-border-dark text-text-muted'}`}>
                        {tool.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(tool)} className="text-xs text-accent hover:text-highlight">Edit</button>
                      <button onClick={() => handleDelete(tool._id, tool.name)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
