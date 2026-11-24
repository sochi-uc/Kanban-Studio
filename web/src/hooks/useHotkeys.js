import { useEffect, useRef } from 'react'

function isEditable(el) {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

/**
 * Single-key shortcuts ("n", "/", "t", "1"...). Ignored while typing in a field, while a modal
 * dialog is open, or when a modifier is held, so Ctrl+T / Cmd+N keep their browser meaning.
 */
export function useHotkeys(map) {
  const mapRef = useRef(map)
  mapRef.current = map

  useEffect(() => {
    function onKey(e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
      if (isEditable(e.target) || document.querySelector('dialog[open]')) return
      const handler = mapRef.current[e.key.toLowerCase()]
      if (handler) {
        e.preventDefault()
        handler(e)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
