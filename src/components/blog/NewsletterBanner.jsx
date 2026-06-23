import { useState, useEffect } from 'react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function NewsletterBanner({ variant = 'full' }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(null)

  // Pull a real subscriber count for social proof — never show a made-up number.
  useEffect(() => {
    api.get('/stats')
      .then(r => setSubscriberCount(r.data.stats?.totalSubscribers ?? null))
      .catch(() => setSubscriberCount(null))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const { data } = await api.post('/subscribers', { email, source: 'post' })
      toast.success(data.message)
      setDone(true)
      setEmail('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Honest social-proof line: only mention a subscriber count if we actually
  // have a meaningful one (10+). Otherwise, skip the claim entirely rather
  // than fabricate a number.
  const socialProof = subscriberCount && subscriberCount >= 10
    ? `Join ${subscriberCount.toLocaleString()}+ developers staying ahead of the curve.`
    : 'Built for developers staying ahead of the curve.'

  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-r from-accent/10 to-highlight/10 border border-accent/20 rounded-xl p-6 my-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-display font-bold text-text-main mb-1">Get the AI & Tech digest every Tuesday</h3>
            <p className="text-text-muted text-sm">{socialProof}</p>
          </div>
          {done ? (
            <span className="text-highlight text-sm font-medium">✓ You're subscribed!</span>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 sm:w-48 bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
              <button type="submit" disabled={loading} className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50">
                {loading ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="bg-gradient-to-br from-accent/10 via-surface to-highlight/5 border border-border-dark rounded-2xl p-8 md:p-12 my-12 text-center">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center mx-auto mb-4">
        <span className="text-white text-xl">📨</span>
      </div>
      <h2 className="font-display font-bold text-2xl md:text-3xl text-text-main mb-3">
        The AI & Tech digest that actually matters
      </h2>
      <p className="text-text-muted max-w-md mx-auto mb-6">
        Every Tuesday: the biggest moves in AI, must-read dev tools, open source highlights, and startup funding you need to know about.
      </p>
      {done ? (
        <p className="text-highlight font-medium text-lg">✓ You're on the list. See you Tuesday.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 bg-primary border border-border-dark rounded-xl py-3 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
          <button type="submit" disabled={loading} className="bg-accent hover:bg-accent/80 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50">
            {loading ? 'Joining...' : 'Join Free'}
          </button>
        </form>
      )}
      <p className="text-text-muted text-xs mt-3">No spam. Unsubscribe anytime.</p>
    </section>
  )
}
