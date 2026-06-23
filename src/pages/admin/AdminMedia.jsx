import { useState, useEffect } from 'react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminMedia() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchMedia = () => {
    setLoading(true)
    api.get('/admin/media').then(r => setMedia(r.data.resources)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchMedia() }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    try {
      await api.post('/admin/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Uploaded!')
      fetchMedia()
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied!')
  }

  const handleDelete = async (publicId) => {
    if (!confirm('Delete this media file?')) return
    try {
      await api.delete(`/admin/media/${encodeURIComponent(publicId)}`)
      toast.success('Deleted')
      fetchMedia()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-main">Media Library</h1>
          <p className="text-text-muted text-sm mt-0.5">{media.length} files</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <span className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-block">
            {uploading ? 'Uploading...' : '+ Upload Image'}
          </span>
        </label>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading...</div>
      ) : media.length === 0 ? (
        <div className="text-center py-20 text-text-muted bg-surface border border-border-dark rounded-xl">
          <p className="text-3xl mb-2">🖼</p>
          <p>No media uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {media.map(item => (
            <div key={item.public_id} className="group relative bg-surface border border-border-dark rounded-lg overflow-hidden aspect-square">
              <img src={item.secure_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <button onClick={() => copyUrl(item.secure_url)}
                  className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg w-full">Copy URL</button>
                <button onClick={() => handleDelete(item.public_id)}
                  className="text-xs bg-red-500/80 text-white px-3 py-1.5 rounded-lg w-full">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
