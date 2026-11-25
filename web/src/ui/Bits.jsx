import { memo } from 'react'
import { LANES, PRIORITIES } from '../lib/meta'
import Icon, { PriorityIcon, StatusIcon } from './Icon'

export const Avatar = memo(function Avatar({ member, name, size = 'sm' }) {
  const hue = member?.hue ?? 'neutral'
  const initials = member?.initials ?? (name && name !== 'Unassigned' ? name.slice(0, 2).toUpperCase() : '–')
  return (
    <span className={`avatar avatar--${size} hue-${hue}`} aria-hidden="true">
      {initials}
    </span>
  )
})

export const LanePill = memo(function LanePill({ status }) {
  return (
    <span className={`lane-pill lane-${status}`}>
      <StatusIcon status={status} />
      {LANES[status]?.label ?? status}
    </span>
  )
})

export const PriorityBadge = memo(function PriorityBadge({ priority, compact = false }) {
  const meta = PRIORITIES[priority] ?? PRIORITIES.medium
  return (
    <span className={`prio prio--${priority}`} title={`${meta.label} priority`}>
      <PriorityIcon priority={priority} size={12} />
      {compact ? meta.code : `${meta.code} · ${meta.label}`}
    </span>
  )
})

export function CheckCircle({ checked, onToggle, label, size = 'md' }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={`check-circle check-circle--${size}${checked ? ' is-checked' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      <Icon name="check" size={size === 'lg' ? 14 : 11} strokeWidth={2.5} />
    </button>
  )
}

export function Spinner({ label = 'Loading' }) {
  return <span className="spinner" role="progressbar" aria-label={label} />
}
