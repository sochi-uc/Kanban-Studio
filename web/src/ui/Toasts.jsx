import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from './Icon'

/**
 * Toast queue. Each toast owns its own timer and may carry one action (e.g. Undo).
 * Announced politely to screen readers via role="status".
 */
export function useToasts() {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message, { tone = 'info', action, duration } = {}) => {
      const id = ++nextId.current
      setToasts((list) => [...list.slice(-2), { id, message, tone, action }])
      const ms = duration ?? (tone === 'error' ? 6000 : action ? 5000 : 2600)
      timers.current.set(id, setTimeout(() => dismiss(id), ms))
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const map = timers.current
    return () => map.forEach(clearTimeout)
  }, [])

  return { toasts, push, dismiss }
}

export function ToastRegion({ toasts, onDismiss }) {
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast glass toast--${t.tone}`}>
          {t.tone === 'error' && <Icon name="alert" size={15} className="toast-icon" />}
          <span>{t.message}</span>
          {t.action && (
            <button
              type="button"
              className="toast-action"
              onClick={() => {
                t.action.onClick()
                onDismiss(t.id)
              }}
            >
              {t.action.label}
            </button>
          )}
          <button type="button" className="toast-close" onClick={() => onDismiss(t.id)} aria-label="Dismiss">
            <Icon name="close" size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
