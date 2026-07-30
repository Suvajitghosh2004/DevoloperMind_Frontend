import { Helmet } from 'react-helmet-async'

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'DeveloperMind'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://developermind.vercel.app'
const SITE_DESC = 'AI, developer tools, startups, cybersecurity and the tech shaping tomorrow. Written for builders, by builders.'
const TWITTER_HANDLE = '@developermind'

export default function SEOHead({
  title,
  description,
  ogImage,
  canonicalUrl,
  type = 'website',          // 'website' | 'article'
  article,                   // { publishedAt, updatedAt, authorName, tags, categoryName }
  breadcrumbs,               // [{ name, url }]
  faqItems,                  // [{ question, answer }]
  noindex = false,
}) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — AI & Tech Blog for Developers`

  const metaDesc = description || SITE_DESC
  const canonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : SITE_URL)
  const image = ogImage || `${SITE_URL}/og-default.png`

  // ── WebSite schema (enables Google Sitelinks Search Box) ──
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string'
    }
  }

  // ── Organization schema ──
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    sameAs: [
      'https://twitter.com/developermind',
    ]
  }

  // ── Article schema ──
  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: metaDesc,
    image: image,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.authorName || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    keywords: article.tags?.join(', '),
    articleSection: article.categoryName,
  } : null

  // ── BreadcrumbList schema ──
  const breadcrumbSchema = breadcrumbs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    }))
  } : null

  // ── FAQ schema ──
  const faqSchema = faqItems?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer }
    }))
  } : null

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Keywords hint (not as powerful as before but still used by some engines) */}
      {article?.tags?.length && (
        <meta name="keywords" content={article.tags.join(', ')} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {article?.publishedAt && <meta property="article:published_time" content={article.publishedAt} />}
      {article?.updatedAt && <meta property="article:modified_time" content={article.updatedAt} />}
      {article?.categoryName && <meta property="article:section" content={article.categoryName} />}
      {article?.tags?.map(tag => <meta key={tag} property="article:tag" content={tag} />)}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={image} />

      {/* RSS Feed discovery */}
      <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} RSS Feed`} href={`${SITE_URL}/rss.xml`} />

      {/* Structured data */}
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      {articleSchema && <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>}
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
      {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      <meta name="google-site-verification" content="dc1f25da0d9c302d" />
    </Helmet>
  )
}