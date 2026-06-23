import { useState, useEffect } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'
import { Link } from 'react-router-dom'
import api from '../../lib/api'

const PLACEMENTS = [
  { name: 'Newsletter Sponsorship', description: 'Reach our subscriber list directly in their inbox every Tuesday.', price: '$299/issue', icon: '📨' },
  { name: 'Tools Directory Listing', description: 'Get your tool listed in our curated directory with a sponsored badge.', price: '$149/month', icon: '🛠' },
  { name: 'In-Article Banner', description: 'Contextual banner placement within relevant articles.', price: '$99/month', icon: '📰' },
  { name: 'Sponsored Post', description: 'Full editorial-style sponsored article written by our team.', price: '$499/post', icon: '✍️' },
]

export default function AdvertisePage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stats')
      .then(r => setStats(r.data.stats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  // Only ever display real, fetched numbers. No invented stats — if a metric
  // isn't tracked yet, we say so honestly instead of making one up.
  const STAT_CARDS = [
    { label: 'Published Articles', value: stats?.totalPosts },
    { label: 'Newsletter Subscribers', value: stats?.totalSubscribers },
    { label: 'Total Article Views', value: stats?.totalViews },
  ]

  return (
    <PublicLayout>
      <SEOHead title="Advertise on DeveloperMind" description="Reach developers, AI researchers, and startup founders." />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-4xl text-text-main mb-4">Advertise on DeveloperMind</h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Reach a growing, highly engaged audience of developers, AI researchers, startup founders, and tech enthusiasts.
          </p>
        </div>

        {/* Real, live stats — pulled from the database, not invented */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface border border-border-dark rounded-xl p-5 text-center animate-pulse">
                <div className="h-8 bg-border-dark rounded w-16 mx-auto mb-2" />
                <div className="h-4 bg-border-dark rounded w-24 mx-auto" />
              </div>
            ))
          ) : (
            STAT_CARDS.map(stat => (
              <div key={stat.label} className="bg-surface border border-border-dark rounded-xl p-5 text-center">
                <p className="font-display font-bold text-3xl text-accent mb-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : '—'}
                </p>
                <p className="text-text-muted text-sm">{stat.label}</p>
              </div>
            ))
          )}
        </div>
        <p className="text-center text-text-muted text-xs -mt-8 mb-12">
          Live numbers, updated automatically. We're an early-stage publication and growing — early sponsors get the best rates.
        </p>

        {/* Placements */}
        <h2 className="font-display font-bold text-2xl text-text-main mb-6">Advertising Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {PLACEMENTS.map(p => (
            <div key={p.name} className="bg-surface border border-border-dark rounded-xl p-6">
              <span className="text-3xl mb-3 block">{p.icon}</span>
              <h3 className="font-display font-semibold text-text-main text-lg mb-2">{p.name}</h3>
              <p className="text-text-muted text-sm mb-4">{p.description}</p>
              <span className="text-accent font-bold font-display">{p.price}</span>
            </div>
          ))}
        </div>

        <div className="text-center bg-gradient-to-r from-accent/10 to-highlight/10 border border-accent/20 rounded-xl p-8">
          <h3 className="font-display font-bold text-2xl text-text-main mb-3">Ready to reach developers?</h3>
          <p className="text-text-muted mb-6">Get in touch and we'll create a custom package for your goals.</p>
          <Link to="/contact" className="inline-block bg-accent hover:bg-accent/80 text-white px-8 py-3 rounded-xl font-medium transition-colors">
            Get in Touch →
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}
