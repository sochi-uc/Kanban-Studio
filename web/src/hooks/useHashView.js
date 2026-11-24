import { useCallback, useEffect, useState } from 'react'
import { VIEWS } from '../lib/meta'

function fromHash() {
  const v = window.location.hash.replace(/^#\/?/, '')
  return VIEWS.includes(v) ? v : 'board'
}

/** Current view lives in the URL hash so refresh, back/forward and deep links all work. */
export function useHashView() {
  const [view, setView] = useState(fromHash)

  useEffect(() => {
    const onHash = () => setView(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((next) => {
    if (VIEWS.includes(next)) window.location.hash = `/${next}`
  }, [])

  return [view, navigate]
}
