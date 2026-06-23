import { useState, useEffect } from 'react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const EMPTY = { title: '', description: '', thumbnail: '', isActive: true }

export default function AdminSeries() {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchSeries = () => {
    setLoading(true)
    api.get('/admin/series').then(r => setSeries(r.data.series)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchSeries() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const uploadThumbnail = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    try {
      const { data } = await api.post('/admin/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm(f => ({ ...f, thumbnail: data.url }))
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/admin/series/${editing}`, form)
        toast.success('Series updated')
      } else {
        await api.post('/admin/series', form)
        toast.success('Series created')
      }
      setForm(EMPTY)
      setEditing(null)
      setShowForm(false)
      fetchSeries()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    }
  }

  const handleEdit = (s) => {
    setForm({ title: s.title, description: s.description || '', thumbnail: s.thumbnail || '', isActive: s.isActive })
    setEditing(s._id)
    setShowForm(true)
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete series "${title}"? Posts assigned to it will remain but lose their series link.`)) return
    try {
      await api.delete(`/admin/series/${id}`)
      toast.success('Series deleted')
      fetchSeries()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-main">Series</h1>
          <p className="text-text-muted text-sm mt-0.5">{series.length} tutorial series</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY) }}
          className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {showForm ? 'Close' : '+ New Series'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border-dark rounded-xl p-5 mb-6 space-y-4">
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent resize-none" />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Thumbnail</label>
            {form.thumbnail && <img src={form.thumbnail} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />}
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" onChange={uploadThumbnail} className="hidden" />
              <span className="block text-center py-2 px-4 bg-primary border border-dashed border-border-dark rounded-lg text-sm text-text-muted hover:border-accent hover:text-accent transition-colors">
                {uploading ? 'Uploading...' : '+ Upload Thumbnail'}
              </span>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-accent" />
            Active (visible to readers)
          </label>
          <button type="submit" className="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            {editing ? 'Update Series' : 'Create Series'}
          </button>
        </form>
      )}

      <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading...</div>
        ) : series.length === 0 ? (
          <div className="p-12 text-center text-text-muted">No series yet.</div>
        ) : (
          <div className="divide-y divide-border-dark">
            {series.map(s => (
              <div key={s._id} className="p-4 flex items-center justify-between gap-4 hover:bg-primary/30 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {s.thumbnail ? (
                    <img src={s.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-xl flex-shrink-0">📚</div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-text-main">{s.title}</h3>
                    <p className="text-xs text-text-muted line-clamp-1">{s.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-500/15 text-green-400' : 'bg-border-dark text-text-muted'}`}>
                    {s.isActive ? 'Active' : 'Hidden'}
                  </span>
                  <button onClick={() => handleEdit(s)} className="text-xs text-accent hover:text-highlight">Edit</button>
                  <button onClick={() => handleDelete(s._id, s.title)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
