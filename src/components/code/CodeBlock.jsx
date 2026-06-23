import { useState } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

export default function CodeBlock({ code, language = 'javascript', filename }) {
  const [copied, setCopied] = useState(false)

  const highlighted = (() => {
    try {
      return language
        ? hljs.highlight(code, { language }).value
        : hljs.highlightAuto(code).value
    } catch {
      return code
    }
  })()

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-dark">
      {/* Header */}
      <div className="bg-[#161b22] flex items-center justify-between px-4 py-2.5 border-b border-border-dark">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          {filename && <span className="text-text-muted text-xs font-mono">{filename}</span>}
          {language && <span className="text-text-muted text-xs ml-auto">{language}</span>}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors px-2 py-1 rounded hover:bg-surface"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="bg-[#0d1117] overflow-x-auto p-4 text-sm">
        <code
          className={`hljs language-${language} font-mono text-sm leading-relaxed`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  )
}
