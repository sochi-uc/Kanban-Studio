// Presentation metadata. The server owns the data (lanes, tags, members, limits);
// this file only maps stable keys to labels and colour tokens.

export const LANES = {
  backlog: { label: 'Backlog', hint: 'Triage pool for upcoming work' },
  todo: { label: 'To Do', hint: 'Committed for this sprint' },
  'in-progress': { label: 'In Progress', hint: 'Actively being built' },
  review: { label: 'Review', hint: 'Code review and QA' },
  done: { label: 'Done', hint: 'Verified and shipped' },
}

// Ordered as P0..P3. Sorting uses `order` with `??` (the old code used `||`, which sorted P0 as P2).
export const PRIORITIES = {
  critical: { label: 'Urgent', code: 'P0', order: 0 },
  high: { label: 'High', code: 'P1', order: 1 },
  medium: { label: 'Medium', code: 'P2', order: 2 },
  low: { label: 'Low', code: 'P3', order: 3 },
}

export const PRIORITY_KEYS = Object.keys(PRIORITIES)

export const SORTS = {
  manual: 'Sort: Created',
  priority: 'Sort: Priority',
  dueDate: 'Sort: Due date',
  'points-desc': 'Sort: Most points',
  'points-asc': 'Sort: Fewest points',
}

export const VIEWS = ['board', 'table', 'analytics']

export function laneLabel(key) {
  return LANES[key]?.label ?? key
}

export function priorityOrder(key) {
  return PRIORITIES[key]?.order ?? 2
}

export function sortTasks(tasks, sort) {
  const list = [...tasks]
  switch (sort) {
    case 'priority':
      return list.sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority))
    case 'points-desc':
      return list.sort((a, b) => b.points - a.points)
    case 'points-asc':
      return list.sort((a, b) => a.points - b.points)
    case 'dueDate':
      return list.sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
    default:
      return list
  }
}

export function matchesQuery(task, q) {
  if (!q) return true
  return (
    task.title.toLowerCase().includes(q) ||
    task.description.toLowerCase().includes(q) ||
    task.tag.toLowerCase().includes(q) ||
    task.assignee.toLowerCase().includes(q)
  )
}

const dateFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
export function shortDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return dateFmt.format(new Date(y, m - 1, d))
}

export function isOverdue(task) {
  if (!task.dueDate || task.status === 'done') return false
  return task.dueDate < new Date().toISOString().slice(0, 10)
}
