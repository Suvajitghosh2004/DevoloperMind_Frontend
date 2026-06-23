import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'

export default function AboutPage() {
  return (
    <PublicLayout>
      <SEOHead title="About DeveloperMind" description="Our mission, team, and affiliate disclosure." />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-4xl text-text-main mb-6">About DeveloperMind</h1>
        <div className="prose-dark space-y-6">
          <div className="bg-gradient-to-r from-accent/10 to-highlight/5 border border-accent/20 rounded-xl p-6">
            <p className="text-text-main font-medium text-lg">
              DeveloperMind is a tech editorial platform for developers, AI researchers, startup founders, and early adopters who want to stay ahead of the curve.
            </p>
          </div>
          <p className="text-text-muted leading-relaxed">
            We cover Artificial Intelligence, Machine Learning, Developer Tools, Startups, Cybersecurity, Web3, Big Tech, Gadgets, Open Source, and in-depth tutorials. Our goal is to deliver high-signal, low-noise content that helps builders build better.
          </p>
          <h2 className="font-display font-bold text-2xl text-text-main pt-4">Our Mission</h2>
          <p className="text-text-muted leading-relaxed">
            To be the most trusted editorial source for developers navigating the rapidly evolving tech landscape. We believe in transparency, accuracy, and putting the reader first — always.
          </p>
          <h2 className="font-display font-bold text-2xl text-text-main pt-4">Affiliate Disclosure</h2>
          <p className="text-text-muted leading-relaxed">
            DeveloperMind participates in affiliate programs including Amazon Associates and various SaaS affiliate networks. When you click certain links and make a purchase, we may earn a commission at no extra cost to you. We only recommend products and tools we genuinely believe in. Sponsored content is clearly labeled.
          </p>
          <h2 className="font-display font-bold text-2xl text-text-main pt-4">AI Content Disclosure</h2>
          <p className="text-text-muted leading-relaxed">
            Some articles on DeveloperMind are AI-assisted — written with the help of AI tools and then reviewed and edited by our human editorial team. These articles are clearly marked with our "AI-Assisted" badge.
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
