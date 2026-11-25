import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { api } from '../api/client'

export const UNDO_MS = 5000

// Server-authoritative board state with optimistic updates.
// Every mutation: apply locally -> call API -> reconcile with the server copy, or roll back on failure.

const initial = { status: 'loading', board: null, tasks: [], error: null }

function reducer(state, action) {
  switch (action.type) {
    case 'loaded': {
      // Tasks with a pending (undo-able) delete stay hidden even if the server still returns them.
      const tasks = action.hidden?.size ? action.board.tasks.filter((t) => !action.hidden.has(t.id)) : action.board.tasks
      return { status: 'ready', board: action.board, tasks, error: null }
    }
    case 'failed':
      return { ...state, status: state.board ? 'ready' : 'error', error: action.error }
    case 'upsert': {
      const exists = state.tasks.some((t) => t.id === action.task.id)
      const tasks = exists
        ? state.tasks.map((t) => (t.id === action.task.id ? action.task : t))
        : [...state.tasks, action.task]
      return { ...state, tasks }
    }
    case 'patch':
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.changes } : t)) }
    case 'remove':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }
    case 'restore': {
      // Re-insert at the original index so a failed delete does not reshuffle the board.
      const tasks = [...state.tasks]
      tasks.splice(Math.min(action.index, tasks.length), 0, action.task)
      return { ...state, tasks }
    }
    default:
      return state
  }
}

export function useBoard({ onError }) {
  const [state, dispatch] = useReducer(reducer, initial)
  const tasksRef = useRef(state.tasks)
  tasksRef.current = state.tasks
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  // Latest request sequence per task: only the newest server reply may overwrite local state,
  // so a slow older PUT can never clobber a newer edit.
  const seq = useRef(new Map())
  const nextSeq = (id) => {
    const n = (seq.current.get(id) ?? 0) + 1
    seq.current.set(id, n)
    return n
  }

  const pendingDeletes = useRef(new Map()) // id -> { timer, task, index }
  const hidden = () => new Set(pendingDeletes.current.keys())

  const reload = useCallback(async (signal) => {
    try {
      dispatch({ type: 'loaded', board: await api.board(signal), hidden: hidden() })
    } catch (err) {
      if (err.name !== 'AbortError') dispatch({ type: 'failed', error: err })
    }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    reload(ctrl.signal)
    return () => ctrl.abort()
  }, [reload])

  const fail = useCallback((err) => onErrorRef.current?.(err), [])

  const moveTask = useCallback(
    async (id, status) => {
      const before = tasksRef.current.find((t) => t.id === id)
      if (!before || before.status === status) return false
      const n = nextSeq(id)
      dispatch({ type: 'patch', id, changes: { status } })
      try {
        const saved = await api.moveTask(id, status)
        if (seq.current.get(id) === n) dispatch({ type: 'upsert', task: saved })
        return true
      } catch (err) {
        if (seq.current.get(id) === n) dispatch({ type: 'patch', id, changes: { status: before.status } })
        fail(err)
        return false
      }
    },
    [fail],
  )

  const updateTask = useCallback(
    async (task) => {
      const n = nextSeq(task.id)
      dispatch({ type: 'upsert', task })
      try {
        const saved = await api.updateTask(task)
        if (seq.current.get(task.id) === n) dispatch({ type: 'upsert', task: saved })
        return saved
      } catch (err) {
        fail(err)
        reload() // server is the source of truth; resync instead of guessing the rollback
        return null
      }
    },
    [fail, reload],
  )

  const createTask = useCallback(
    async (draft) => {
      try {
        const saved = await api.createTask(draft)
        dispatch({ type: 'upsert', task: saved })
        return saved
      } catch (err) {
        fail(err)
        return null
      }
    },
    [fail],
  )

  /**
   * Deletes are optimistic and undo-able: the card disappears at once, the DELETE is sent after
   * UNDO_MS unless undone. Returns the undo function. Pending deletes are flushed (keepalive) if the
   * page is closed, so nothing is silently lost.
   */
  const deleteTask = useCallback(
    (id) => {
      const index = tasksRef.current.findIndex((t) => t.id === id)
      if (index < 0) return () => {}
      const task = tasksRef.current[index]
      nextSeq(id)
      dispatch({ type: 'remove', id })

      const commit = async () => {
        pendingDeletes.current.delete(id)
        try {
          await api.deleteTask(id)
        } catch (err) {
          if (err.status !== 404) {
            dispatch({ type: 'restore', task, index })
            fail(err)
          }
        }
      }
      pendingDeletes.current.set(id, { timer: setTimeout(commit, UNDO_MS), task, index })

      return () => {
        const pending = pendingDeletes.current.get(id)
        if (!pending) return
        clearTimeout(pending.timer)
        pendingDeletes.current.delete(id)
        dispatch({ type: 'restore', task: pending.task, index: pending.index })
      }
    },
    [fail],
  )

  useEffect(() => {
    const pending = pendingDeletes.current
    const flush = () => {
      for (const [id, p] of pending) {
        clearTimeout(p.timer)
        api.deleteTask(id, { keepalive: true }).catch(() => {})
      }
      pending.clear()
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush() // e.g. signing out with a delete still pending
    }
  }, [])

  const boardCall = useCallback(
    async (call) => {
      try {
        dispatch({ type: 'loaded', board: await call(), hidden: hidden() })
        return true
      } catch (err) {
        fail(err)
        return false
      }
    },
    [fail],
  )
  const renameBoard = useCallback((name) => boardCall(() => api.renameBoard(name)), [boardCall])
  const addMember = useCallback((name, role) => boardCall(() => api.addMember(name, role)), [boardCall])
  const removeMember = useCallback((id) => boardCall(() => api.removeMember(id)), [boardCall])

  const actions = useMemo(
    () => ({ reload, moveTask, updateTask, createTask, deleteTask, renameBoard, addMember, removeMember }),
    [reload, moveTask, updateTask, createTask, deleteTask, renameBoard, addMember, removeMember],
  )

  return { ...state, actions }
}
