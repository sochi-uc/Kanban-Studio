import { useEffect, useId, useRef } from 'react'
import Icon from './Icon'

/**
 * Native <dialog> modal: the browser provides the top layer, inert background, focus trap,
 * Esc-to-close and focus restoration, which the old div overlay lacked.
 */
export default function Dialog({ open, onClose, title, children, footer, size = 'md', initialFocusRef }) {
  const ref = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      initialFocusRef?.current?.focus()
    } else if (!open && el.open) {
      el.close()
    }
  }, [open, initialFocusRef])

  return (
    <dialog
      ref={ref}
      className={`dialog dialog--${size} glass`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose() // backdrop click
      }}
    >
      {open && (
        <div className="dialog-inner">
          <header className="dialog-header">
            <h2 id={titleId} className="dialog-title">
              {title}
            </h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
          </header>
          <div className="dialog-body">{children}</div>
          {footer && <footer className="dialog-footer">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', tone = 'danger', onConfirm, onClose }) {
  const cancelRef = useRef(null)
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      initialFocusRef={cancelRef}
      footer={
        <>
          <button ref={cancelRef} type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn--danger' : 'btn--primary'}`}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="dialog-message">{message}</p>
    </Dialog>
  )
}
