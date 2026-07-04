import { useEffect, useRef } from 'react'

export default function NativeBanner() {
  const iframeRef = useRef(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; overflow: hidden; }
  </style>
</head>
<body>
  <div id="container-0bdb769a1fc6d18ef6b2f6ca549d1db3"></div>
  <script async="async" data-cfasync="false"
    src="https://pl30148858.effectivecpmnetwork.com/0bdb769a1fc6d18ef6b2f6ca549d1db3/invoke.js">
  <\/script>
</body>
</html>`

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return

    doc.open()
    doc.write(html)
    doc.close()

    const resizeObserver = new ResizeObserver(() => {
      try {
        const body = iframe.contentDocument?.body
        if (body && body.scrollHeight > 0) {
          iframe.style.height = body.scrollHeight + 'px'
        }
      } catch {}
    })

    iframe.onload = () => {
      try {
        const body = iframe.contentDocument?.body
        if (body) {
          resizeObserver.observe(body)
          if (body.scrollHeight > 0) {
            iframe.style.height = body.scrollHeight + 'px'
          }
        }
      } catch {}
    }

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <iframe
      ref={iframeRef}
      style={{ width: '100%', minHeight: '120px', border: 'none', display: 'block' }}
      scrolling="no"
      title="Advertisement"
    />
  )
}