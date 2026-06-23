import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <SEOHead title="404 — Page Not Found" />
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-8xl font-display font-bold bg-gradient-to-r from-accent to-highlight bg-clip-text text-transparent mb-4">
            404
          </div>
          <h1 className="font-display font-bold text-3xl text-text-main mb-4">
            This page got lost in the void
          </h1>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            The article, tool, or page you were looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/" className="bg-accent hover:bg-accent/80 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              ← Back to Home
            </Link>
            <Link to="/search" className="bg-surface border border-border-dark hover:border-accent text-text-muted hover:text-text-main px-6 py-3 rounded-xl font-medium transition-colors">
              Search Articles
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
