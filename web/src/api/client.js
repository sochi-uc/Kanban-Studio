// Sent on every request. The API rejects state-changing calls without it (CSRF guard): a cross-site
// form cannot set custom headers, and a cross-site fetch would need a CORS preflight the API never grants.
const CLIENT_HEADER = { 'X-Kanban-Client': 'web' }

export class ApiError extends Error {
  constructor(status, problem) {
    super(messageFrom(status, problem))
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }
}

function messageFrom(status, problem) {
  const fieldErrors = problem?.errors && Object.values(problem.errors).flat()
  if (fieldErrors?.length) return fieldErrors[0]
  if (problem?.detail) return problem.detail
  if (status === 429) return 'Too many requests. Wait a moment and try again.'
  if (status === 0) return 'Network unavailable. Check your connection.'
  return problem?.title ?? `Request failed (${status}).`
}

let onUnauthorized = () => {}
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

export async function request(path, { method = 'GET', body, signal, keepalive } = {}) {
  const headers = { ...CLIENT_HEADER, Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      keepalive,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError(0, null)
  }

  if (res.status === 401 && !path.startsWith('/auth/login')) onUnauthorized()
  if (res.status === 204) return null

  const isJson = res.headers.get('Content-Type')?.includes('json')
  const data = isJson ? await res.json().catch(() => null) : null
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

export const api = {
  me: () => request('/auth/me'),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (email, password, displayName) =>
    request('/auth/register', { method: 'POST', body: { email, password, displayName } }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  board: (signal) => request('/board', { signal }),
  renameBoard: (name) => request('/board', { method: 'PATCH', body: { name } }),
  addMember: (name, role) => request('/board/members', { method: 'POST', body: { name, role } }),
  removeMember: (id) => request(`/board/members/${id}`, { method: 'DELETE' }),
  createTask: (task) => request('/tasks', { method: 'POST', body: toRequest(task) }),
  updateTask: (task) => request(`/tasks/${task.id}`, { method: 'PUT', body: toRequest(task) }),
  moveTask: (id, status) => request(`/tasks/${id}/status`, { method: 'PATCH', body: { status } }),
  // keepalive lets a pending (undo-able) delete still reach the server if the tab is closing.
  deleteTask: (id, { keepalive = false } = {}) => request(`/tasks/${id}`, { method: 'DELETE', keepalive }),
}

// Explicit allow-list of writable fields. The API rejects unknown properties, so never spread a task object.
function toRequest(t) {
  return {
    title: t.title,
    description: t.description ?? '',
    status: t.status,
    priority: t.priority,
    points: Number(t.points),
    assignee: t.assignee,
    tag: t.tag,
    dueDate: t.dueDate || null,
    subtasks: (t.subtasks ?? []).map((s) => ({ id: s.local ? null : s.id, text: s.text, done: s.done })),
  }
}
