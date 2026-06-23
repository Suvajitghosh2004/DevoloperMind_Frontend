import { Helmet } from 'react-helmet-async'

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'DeveloperMind'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://developermind.vercel.app'

export default function SEOHead({
  title,
  description = 'Your weekly digest on AI, developer tools, startups, and the tech shaping tomorrow.',
  ogImage,
  canonicalUrl,
  type = 'website',
  article,
  faqItems
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — AI & Tech Blog`
  const canonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : SITE_URL)
  const image = ogImage || `${SITE_URL}/og-default.png`

  const articleSchema = article ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Person', name: article.authorName },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: `${SITE_URL}/logo.png` }
  }) : null

  const faqSchema = faqItems?.length ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer }
    }))
  }) : null

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* OG */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Schemas */}
      {articleSchema && <script type="application/ld+json">{articleSchema}</script>}
      {faqSchema && <script type="application/ld+json">{faqSchema}</script>}
    </Helmet>
  )
}
