import { useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contact', form)
      toast.success('Message sent! We\'ll get back to you soon.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <SEOHead title="Contact Us" description="Get in touch with the DeveloperMind team." />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-4xl text-text-main mb-3">Contact Us</h1>
        <p className="text-text-muted mb-8">Questions, tips, partnership inquiries, or just want to say hi?</p>

        <form onSubmit={handleSubmit} className="bg-surface border border-border-dark rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-muted mb-1.5 block">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required
                className="w-full bg-primary border border-border-dark rounded-lg py-2.5 px-3 text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent text-sm" />
            </div>
            <div>
              <label className="text-sm text-text-muted mb-1.5 block">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required
                className="w-full bg-primary border border-border-dark rounded-lg py-2.5 px-3 text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm text-text-muted mb-1.5 block">Subject</label>
            <input type="text" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))}
              className="w-full bg-primary border border-border-dark rounded-lg py-2.5 px-3 text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent text-sm" />
          </div>
          <div>
            <label className="text-sm text-text-muted mb-1.5 block">Message *</label>
            <textarea rows={5} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} required
              className="w-full bg-primary border border-border-dark rounded-lg py-2.5 px-3 text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent text-sm resize-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent/80 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </PublicLayout>
  )
}
