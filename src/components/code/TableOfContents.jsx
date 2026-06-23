import { useState, useEffect } from 'react'

export default function TableOfContents({ items = [] }) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!items.length) return
    const headings = items.map(item => document.getElementById(item.anchor)).filter(Boolean)
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-10% 0px -80% 0px' }
    )
    headings.forEach(h => observer.observe(h))
    return () => observer.disconnect()
  }, [items])

  if (!items.length) return null

  const scrollTo = (anchor) => {
    const el = document.getElementById(anchor)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: 'smooth' })
      setActive(anchor)
      history.replaceState(null, '', `#${anchor}`)
    }
  }

  return (
    <nav>
      <h4 className="font-display font-semibold text-text-main text-sm mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h12M4 18h8" />
        </svg>
        Table of Contents
      </h4>

      <div style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }} className="pr-1">
        <ul className="space-y-0.5">
          {items.map(item => (
            <li key={item.anchor} style={{ paddingLeft: item.level === 3 ? '10px' : '0' }}>
              <button
                type="button"
                onClick={() => scrollTo(item.anchor)}
                className={`group flex items-start gap-2 py-1.5 px-3 rounded-lg text-sm transition-all duration-150 w-full text-left ${
                  active === item.anchor
                    ? 'bg-accent/10 text-accent font-medium border-l-2 border-accent'
                    : 'text-text-muted hover:text-text-main hover:bg-surface'
                }`}
              >
                <span className={`mt-2 w-1 h-1 rounded-full flex-shrink-0 transition-colors ${
                  active === item.anchor ? 'bg-accent' : 'bg-border-dark group-hover:bg-text-muted'
                }`} />
                <span className="leading-snug">{item.heading}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}