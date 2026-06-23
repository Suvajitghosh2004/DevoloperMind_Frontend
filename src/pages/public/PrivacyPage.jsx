import PublicLayout from '../../components/layout/PublicLayout'
import SEOHead from '../../components/ui/SEOHead'

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <SEOHead title="Privacy Policy" />
      <div className="max-w-3xl mx-auto px-4 py-12 prose-dark">
        <h1 className="font-display font-bold text-4xl text-text-main mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-text-muted leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-xl text-text-main mb-3">Data We Collect</h2>
            <p>When you subscribe to our newsletter, we collect your email address and optionally your name. When you post a comment, we collect your name, email, and comment content. We also collect standard server logs including IP addresses.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-xl text-text-main mb-3">How We Use Your Data</h2>
            <p>We use your email address to send our weekly newsletter if you've subscribed. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-xl text-text-main mb-3">Cookies & Analytics</h2>
            <p>We may use cookies for analytics purposes to understand how readers interact with our content. Third-party services (Google AdSense, Google Analytics) may also set cookies.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-xl text-text-main mb-3">Affiliate Links</h2>
            <p>Some links on this site are affiliate links. When you click and make a purchase, we may earn a commission. Affiliate links are disclosed in our content and footer.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-xl text-text-main mb-3">Your Rights</h2>
            <p>You can unsubscribe from our newsletter at any time. To request deletion of your data, contact us at privacy@developermind.com.</p>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
