import { useEffect, useRef } from 'react'

export default function NativeBanner() {
  const ref = useRef(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !ref.current) return
    loaded.current = true

    // Clear any previous content
    ref.current.innerHTML = ''

    // Container div
    const container = document.createElement('div')
    container.id = 'container-0bdb769a1fc6d18ef6b2f6ca549d1db3'
    ref.current.appendChild(container)

    // Script
    const script = document.createElement('script')
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    script.src = 'https://pl30148858.effectivecpmnetwork.com/0bdb769a1fc6d18ef6b2f6ca549d1db3/invoke.js'
    ref.current.appendChild(script)

    return () => {
      if (ref.current) ref.current.innerHTML = ''
      loaded.current = false
    }
  }, [])

  return (
    <div ref={ref} className="w-full overflow-hidden" />
  )
}