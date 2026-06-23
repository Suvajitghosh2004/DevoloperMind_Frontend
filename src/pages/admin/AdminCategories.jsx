import { useState, useEffect } from 'react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const COLORS = ['#6366F1', '#22D3EE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#3B82F6']

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] })
  const [editing, setEditing] = useState(null)

  const fetchCategories = () => {
    setLoading(true)
    api.get('/admin/categories').then(r => setCategories(r.data.categories)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing}`, form)
        toast.success('Category updated')
      } else {
        await api.post('/admin/categories', form)
        toast.success('Category created')
      }
      setForm({ name: '', description: '', color: COLORS[0] })
      setEditing(null)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    }
  }

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', color: cat.color })
    setEditing(cat._id)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return
    try {
      await api.delete(`/admin/categories/${id}`)
      toast.success('Category deleted')
      fetchCategories()
    } catch {
      toast.error('Delete failed')
    }
  }

  const toggleActive = async (cat) => {
    try {
      await api.put(`/admin/categories/${cat._id}`, { isActive: !cat.isActive })
      fetchCategories()
    } catch {
      toast.error('Update failed')
    }
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-text-main mb-6">Categories</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-surface border border-border-dark rounded-xl p-5 h-fit">
          <h3 className="font-display font-semibold text-text-main text-sm mb-4">
            {editing ? 'Edit Category' : 'New Category'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2}
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent resize-none" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({...f, color: c}))}
                    className={`w-7 h-7 rounded-full border-2 ${form.color === c ? 'border-text-main' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-accent hover:bg-accent/80 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                {editing ? 'Update' : 'Create'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '', color: COLORS[0] }) }}
                  className="px-4 bg-surface border border-border-dark rounded-lg text-sm text-text-muted hover:text-text-main transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-surface border border-border-dark rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-text-muted">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-text-muted">No categories yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-dark text-left">
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Category</th>
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Posts</th>
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {categories.map(cat => (
                  <tr key={cat._id} className="hover:bg-primary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm text-text-main font-medium">{cat.name}</span>
                      </div>
                      <p className="text-xs text-text-muted ml-5">{cat.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">{cat.postCount}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(cat)}
                        className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? 'bg-green-500/15 text-green-400' : 'bg-border-dark text-text-muted'}`}>
                        {cat.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(cat)} className="text-xs text-accent hover:text-highlight">Edit</button>
                        <button onClick={() => handleDelete(cat._id, cat.name)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
