// Option lists for <Select>, built once per board so every dropdown shows the same icons.
import { LANES, PRIORITIES, PRIORITY_KEYS, SORTS } from './meta'
import Icon, { PriorityIcon, StatusIcon } from '../ui/Icon'
import { Avatar } from '../ui/Bits'

export const statusOptions = (lanes) =>
  lanes.map((l) => ({ value: l.key, label: LANES[l.key]?.label ?? l.key, icon: <StatusIcon status={l.key} /> }))

export const priorityOptions = () =>
  PRIORITY_KEYS.map((k) => ({ value: k, label: PRIORITIES[k].label, hint: PRIORITIES[k].code, icon: <PriorityIcon priority={k} /> }))

export const memberOptions = (members) => [
  ...members.map((m) => ({ value: m.name, label: m.name, hint: m.role, icon: <Avatar member={m} size="xs" /> })),
  { value: 'Unassigned', label: 'Unassigned', icon: <Avatar name="Unassigned" size="xs" /> },
]

export const tagOptions = (tags) => tags.map((t) => ({ value: t, label: t, icon: <Icon name="hash" size={14} /> }))

export const pointOptions = (points) => points.map((p) => ({ value: p, label: `${p} ${p === 1 ? 'point' : 'points'}` }))

export const sortOptions = () =>
  Object.entries(SORTS).map(([value, label]) => ({ value, label: label.replace(/^Sort: /, '') }))
