import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import Icon from './Icon'

/**
 * Glass listbox dropdown — replaces native <select>, which can't show icons/avatars and renders
 * as an unstyleable OS menu.
 *
 * - Renders the list in the top layer via the native `popover` API (works inside modal <dialog>s,
 *   light-dismiss and Esc for free).
 * - WAI-ARIA "select-only combobox" pattern: trigger is a combobox button, list is a listbox,
 *   active option tracked with aria-activedescendant.
 * - Keyboard: ↑/↓/Home/End move, Enter/Space choose, Esc closes, type-ahead jumps by first letter,
 *   ↑/↓ on the closed trigger opens it.
 * - Positioned with JS (CSSOM, so it's CSP-safe); flips above the trigger when there's no room below.
 *
 * options: [{ value, label, icon?: ReactNode, hint?: string }]
 */
export default function Select({
  value,
  onChange,
  options,
  label,
  variant = 'field',
  className = '',
  placeholder = 'Select…',
  renderValue,
  disabled = false,
  align = 'start',
}) {
  const id = useId()
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const typeahead = useRef({ text: '', timer: 0 })
  const [open, setOpen] = useState(false)
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )
  const [active, setActive] = useState(selectedIndex)
  const selected = options.find((o) => o.value === value)

  const show = useCallback(() => {
    if (disabled) return
    setActive(selectedIndex)
    listRef.current?.showPopover()
  }, [disabled, selectedIndex])

  const hide = useCallback((refocus = true) => {
    listRef.current?.hidePopover()
    if (refocus) triggerRef.current?.focus()
  }, [])

  const choose = useCallback(
    (i) => {
      const opt = options[i]
      if (!opt) return
      hide()
      if (opt.value !== value) onChange(opt.value)
    },
    [options, value, onChange, hide],
  )

  // Sync React state with the popover's own open/close (light dismiss, Esc).
  useEffect(() => {
    const el = listRef.current
    const onToggle = (e) => setOpen(e.newState === 'open')
    el.addEventListener('toggle', onToggle)
    return () => el.removeEventListener('toggle', onToggle)
  }, [])

  // Position under (or above) the trigger.
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const t = triggerRef.current.getBoundingClientRect()
      const list = listRef.current
      const gap = 6
      const width = Math.max(t.width, 200)
      const h = Math.min(list.scrollHeight, 320)
      const below = window.innerHeight - t.bottom - gap
      const top = below >= h || below >= t.top ? t.bottom + gap : Math.max(8, t.top - gap - h)
      let left = align === 'end' ? t.right - width : t.left
      left = Math.min(Math.max(8, left), window.innerWidth - width - 8)
      list.style.top = `${top}px`
      list.style.left = `${left}px`
      list.style.minWidth = `${width}px`
      list.style.maxHeight = `${Math.max(160, Math.min(320, below >= h ? below - 8 : t.top - 16))}px`
    }
    place()
    window.addEventListener('resize', place)
    // Close if anything other than the list scrolls (the anchor would drift away).
    const onScroll = (e) => {
      if (!listRef.current.contains(e.target)) hide(false)
    }
    window.addEventListener('scroll', onScroll, true)
    listRef.current.focus({ preventScroll: true })
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, align, hide])

  // Keep the active option in view.
  useEffect(() => {
    if (open) document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active, id])

  function onTypeahead(key) {
    const ta = typeahead.current
    clearTimeout(ta.timer)
    ta.text += key.toLowerCase()
    ta.timer = setTimeout(() => (ta.text = ''), 600)
    const start = open ? active + 1 : selectedIndex + 1
    const order = [...options.keys()].map((k) => (k + start) % options.length)
    const hit = order.find((i) => options[i].label.toLowerCase().startsWith(ta.text))
    if (hit != null) {
      if (open) setActive(hit)
      else if (options[hit].value !== value) onChange(options[hit].value)
    }
  }

  function onListKey(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActive((a) => Math.min(options.length - 1, a + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActive((a) => Math.max(0, a - 1))
        break
      case 'Home':
        e.preventDefault()
        setActive(0)
        break
      case 'End':
        e.preventDefault()
        setActive(options.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        choose(active)
        break
      case 'Tab':
        hide(false)
        break
      case 'Escape':
        e.preventDefault()
        e.stopPropagation() // don't also close a surrounding dialog/inspector
        hide()
        break
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) onTypeahead(e.key)
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={label}
        disabled={disabled}
        className={`dd dd--${variant}${open ? ' is-open' : ''} ${className}`}
        onClick={() => (open ? hide() : show())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            show()
          } else if (e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            onTypeahead(e.key)
          }
        }}
      >
        {renderValue ? (
          renderValue(selected)
        ) : (
          <>
            {selected?.icon && <span className="dd-icon">{selected.icon}</span>}
            <span className={`dd-value${selected ? '' : ' is-placeholder'}`}>{selected?.label ?? placeholder}</span>
          </>
        )}
        <Icon name="chevrons" size={14} className="dd-chevron" />
      </button>

      <div
        ref={listRef}
        id={`${id}-list`}
        popover="auto"
        role="listbox"
        aria-label={label}
        tabIndex={-1}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        className="dd-list glass"
        onKeyDown={onListKey}
      >
        {options.map((o, i) => (
          <div
            key={String(o.value)}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={o.value === value}
            className={`dd-option${i === active ? ' is-active' : ''}${o.value === value ? ' is-selected' : ''}`}
            onPointerMove={() => i !== active && setActive(i)}
            onClick={() => choose(i)}
          >
            {o.icon && <span className="dd-icon">{o.icon}</span>}
            <span className="dd-label">{o.label}</span>
            {o.hint && <span className="dd-hint">{o.hint}</span>}
            <Icon name="check" size={14} strokeWidth={2.2} className="dd-check" />
          </div>
        ))}
      </div>
    </>
  )
}
