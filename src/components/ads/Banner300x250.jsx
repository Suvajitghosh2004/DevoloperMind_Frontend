import { useEffect, useRef } from 'react'

export default function Banner300x250() {
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!iframeRef.current) return

    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document
    if (!doc) return

    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; display: flex; justify-content: center; align-items: center; width: 300px; height: 250px; overflow: hidden; }
  </style>
</head>
<body>
  <script>
    window.atOptions = {
      'key': 'e25f6794d41800cabf54897f31909493',
      'format': 'iframe',
      'height': 250,
      'width': 300,
      'params': {}
    };
  <\/script>
  <script src="https://www.highperformanceformat.com/e25f6794d41800cabf54897f31909493/invoke.js"><\/script>
</body>
</html>`

    doc.open()
    doc.write(html)
    doc.close()
  }, [])

  return (
    <div className="flex justify-center my-2">
      <iframe
        ref={iframeRef}
        style={{ width: '300px', height: '250px', border: 'none', display: 'block' }}
        scrolling="no"
        title="Advertisement"
      />
    </div>
  )
}