import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcast, setBroadcast] = useState({ subject: '', html: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    api.get('/admin/subscribers', { params: { limit: 100 } })
      .then(r => { setSubscribers(r.data.subscribers); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }, [])

  const exportCSV = () => {
    window.open('/api/admin/subscribers/export?token=' + localStorage.getItem('accessToken'), '_blank')
  }

  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (!broadcast.subject || !broadcast.html) { toast.error('Subject and content required'); return }
    setSending(true)
    try {
      const { data } = await api.post('/admin/subscribers/broadcast', broadcast)
      toast.success(data.message)
      setShowBroadcast(false)
      setBroadcast({ subject: '', html: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Send failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-main">Subscribers</h1>
          <p className="text-text-muted text-sm mt-0.5">{total} active subscribers</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="bg-surface border border-border-dark hover:border-accent text-text-muted hover:text-text-main px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Export CSV
          </button>
          <button onClick={() => setShowBroadcast(true)}
            className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Send Broadcast
          </button>
        </div>
      </div>

      {/* Broadcast modal */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-dark rounded-xl p-6 w-full max-w-2xl">
            <h2 className="font-display font-bold text-text-main text-lg mb-4">Send Newsletter Broadcast</h2>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Subject</label>
                <input value={broadcast.subject} onChange={e => setBroadcast(b => ({...b, subject: e.target.value}))} required
                  className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">HTML Content</label>
                <textarea value={broadcast.html} onChange={e => setBroadcast(b => ({...b, html: e.target.value}))} rows={8} required
                  placeholder="<h2>This week in AI...</h2><p>...</p>"
                  className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main font-mono focus:outline-none focus:border-accent resize-none" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowBroadcast(false)}
                  className="px-4 py-2 bg-surface border border-border-dark rounded-lg text-sm text-text-muted hover:text-text-main">
                  Cancel
                </button>
                <button type="submit" disabled={sending}
                  className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {sending ? 'Sending...' : `Send to ${total} subscribers`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-text-muted">No subscribers yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-dark text-left">
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Source</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {subscribers.map(sub => (
                <tr key={sub._id} className="hover:bg-primary/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-text-main">{sub.email}</td>
                  <td className="px-4 py-3 text-xs text-text-muted capitalize">{sub.source}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
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
