export default function ToolCard({ tool }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(tool.rating || 0))

  return (
    <div className="bg-surface border border-border-dark rounded-xl p-5 card-hover flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {tool.logo ? (
            <img src={tool.logo} alt={tool.name} className="w-10 h-10 rounded-lg object-contain bg-primary p-1" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold font-display">
              {tool.name?.[0]}
            </div>
          )}
          <div>
            <h3 className="font-display font-semibold text-text-main text-sm">{tool.name}</h3>
            <span className="text-xs text-text-muted">{tool.category}</span>
          </div>
        </div>
        {tool.isSponsored && (
          <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full flex-shrink-0">Sponsored</span>
        )}
      </div>

      <p className="text-text-muted text-sm leading-relaxed flex-1">{tool.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {stars.map((filled, i) => (
            <svg key={i} className={`w-3.5 h-3.5 ${filled ? 'text-yellow-400' : 'text-border-dark'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          {tool.rating && <span className="text-xs text-text-muted ml-1">{tool.rating}</span>}
        </div>
        {tool.badge && (
          <span className="text-xs text-highlight bg-highlight/10 px-2 py-0.5 rounded-full">{tool.badge}</span>
        )}
      </div>

      <a
        href={tool.affiliateUrl || tool.websiteUrl || '#'}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="block text-center py-2 px-4 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/30 hover:border-accent rounded-lg text-sm font-medium transition-all"
      >
        Visit Tool →
      </a>
    </div>
  )
}
