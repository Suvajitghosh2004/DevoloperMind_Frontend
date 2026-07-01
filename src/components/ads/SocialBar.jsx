import { useEffect, useRef } from 'react'

// Social Bar floats over the page automatically — just load the script once.
// Place this component once in your layout (e.g. App.jsx or PublicLayout).
let socialBarLoaded = false

export default function SocialBar() {
  useEffect(() => {
    if (socialBarLoaded) return
    socialBarLoaded = true

    const script = document.createElement('script')
    script.src = 'https://pl30148859.effectivecpmnetwork.com/a5/8b/8f/a58b8fe16cf7bd22a5fa8a51d03f931f.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Social Bar renders itself into the page — no visible container needed
  return null
}