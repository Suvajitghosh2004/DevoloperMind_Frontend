import { useEffect, useRef } from 'react'

export default function Banner300x250() {
  const ref = useRef(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !ref.current) return
    loaded.current = true

    ref.current.innerHTML = ''

    // Set atOptions before loading the script
    const optionsScript = document.createElement('script')
    optionsScript.innerHTML = `
      window.atOptions = {
        'key': 'e25f6794d41800cabf54897f31909493',
        'format': 'iframe',
        'height': 250,
        'width': 300,
        'params': {}
      };
    `
    ref.current.appendChild(optionsScript)

    const invokeScript = document.createElement('script')
    invokeScript.src = 'https://www.highperformanceformat.com/e25f6794d41800cabf54897f31909493/invoke.js'
    invokeScript.async = true
    ref.current.appendChild(invokeScript)

    return () => {
      if (ref.current) ref.current.innerHTML = ''
      loaded.current = false
    }
  }, [])

  return (
    <div className="flex justify-center my-4">
      <div
        ref={ref}
        style={{ width: '300px', minHeight: '250px' }}
        className="overflow-hidden"
      />
    </div>
  )
}