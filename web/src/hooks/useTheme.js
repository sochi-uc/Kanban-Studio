import { useCallback, useEffect, useState } from 'react'

const KEY = 'kanban.theme'
const ORDER = ['system', 'light', 'dark']

function read() {
  try {
    const v = localStorage.getItem(KEY)
    return ORDER.includes(v) ? v : 'system' // validate anything read from storage
  } catch {
    return 'system'
  }
}

/** 'system' | 'light' | 'dark'. Applied as data-theme on <html>; 'system' defers to the OS via CSS. */
export function useTheme() {
  const [theme, setTheme] = useState(read)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* storage disabled: preference just won't persist */
    }
  }, [theme])

  const set = useCallback((next) => ORDER.includes(next) && setTheme(next), [])
  return [theme, set]
}
