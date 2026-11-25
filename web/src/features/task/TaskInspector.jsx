import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { memberOptions, priorityOptions, statusOptions, tagOptions } from '../../lib/options'
import Select from '../../ui/Select'
import { CheckCircle } from '../../ui/Bits'
import Icon, { StatusIcon } from '../../ui/Icon'

const SAVE_DELAY_MS = 600
const LIMITS = { title: 200, description: 4000, subtask: 300, subtasks: 50 }

function clone(task) {
  return { ...task, subtasks: task.subtasks.map((s) => ({ ...s })) }
}

// After a save, adopt server-issued ids for subtasks that were created locally.
function adoptServerIds(draft, saved) {
  let changed = false
  const subtasks = draft.subtasks.map((s, i) => {
    const server = saved.subtasks[i]
    if (s.local && server && server.text === s.text.trim()) {
      changed = true
      return { ...server }
    }
    return s
  })
  return changed ? { ...draft, subtasks } : draft
}

/**
 * Right-hand inspector. Keeps a local draft so typing never waits on the network:
 * discrete controls save immediately, text fields save after a 600 ms pause (was: one request per keystroke),
 * and anything pending is flushed when the panel closes.
 */
export default function TaskInspector({ task, board, onSave, onMove, onDelete, onClose }) {
  const [draft, setDraft] = useState(() => clone(task))
  const opts = useMemo(
    () => ({
      status: statusOptions(board.lanes),
      priority: priorityOptions(),
      members: memberOptions(board.members),
      tags: tagOptions(board.tags),
    }),
    [board],
  )
  const [newSubtask, setNewSubtask] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef(null)
  const timer = useRef(null)
  const panelRef = useRef(null)

  const flush = useCallback(async () => {
    clearTimeout(timer.current)
    timer.current = null
    const next = pending.current
    pending.current = null
    if (!next || !next.title.trim()) return
    setSaving(true)
    const saved = await onSave(next)
    setSaving(false)
    if (saved) setDraft((d) => adoptServerIds(d, saved))
  }, [onSave])

  const flushRef = useRef(flush)
  flushRef.current = flush
  useEffect(() => () => void flushRef.current(), []) // flush on close/unmount

  useEffect(() => panelRef.current?.focus(), [])

  // A move made elsewhere (board drag, table select) must not be reverted by this draft.
  useEffect(() => {
    setDraft((d) => (d.status === task.status ? d : { ...d, status: task.status }))
  }, [task.status])

  function commit(changes, { debounce = false } = {}) {
    setDraft((d) => {
      const next = { ...d, ...changes }
      pending.current = next
      return next
    })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => flushRef.current(), debounce ? SAVE_DELAY_MS : 0)
  }

  const setStatus = (status) => {
    setDraft((d) => ({ ...d, status }))
    if (pending.current) pending.current = { ...pending.current, status }
    onMove(task.id, status)
  }

  const subtasks = draft.subtasks
  const subDone = subtasks.filter((s) => s.done).length
  const pct = subtasks.length ? Math.round((subDone / subtasks.length) * 100) : 0
  const done = draft.status === 'done'
  const titleInvalid = !draft.title.trim()

  function addSubtask() {
    const text = newSubtask.trim()
    if (!text || subtasks.length >= LIMITS.subtasks) return
    setNewSubtask('')
    commit({ subtasks: [...subtasks, { id: `local-${crypto.randomUUID()}`, text, done: false, local: true }] })
  }

  return (
    <aside
      ref={panelRef}
      className="inspector glass"
      aria-label={`Task details: ${task.title}`}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          onClose()
        }
      }}
    >
      <header className="inspector-head">
        <span className={`save-state${saving ? ' is-saving' : ''}`} aria-live="polite">
          {saving ? 'Saving…' : 'Saved'}
        </span>
        <div className="inspector-actions">
          <button type="button" className="icon-btn" onClick={() => {
              // Drop unsaved edits so the close-flush can't resurrect a task pending deletion.
              clearTimeout(timer.current)
              pending.current = null
              onDelete(task)
            }}
            aria-label="Delete task"
            title="Delete task"
          >
            <Icon name="trash" />
          </button>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close details (Esc)">
            <Icon name="close" />
          </button>
        </div>
      </header>

      <div className="inspector-body">
        <div className="inspector-title">
          <CheckCircle
            size="lg"
            checked={done}
            onToggle={() => setStatus(done ? 'todo' : 'done')}
            label={done ? 'Mark not done' : 'Mark done'}
          />
          <label className="sr-only" htmlFor="insp-title">
            Title
          </label>
          <textarea
            id="insp-title"
            className={`title-input${done ? ' is-done' : ''}`}
            rows={1}
            maxLength={LIMITS.title}
            value={draft.title}
            aria-invalid={titleInvalid}
            onChange={(e) => commit({ title: e.target.value.replace(/\n/g, ' ') }, { debounce: true })}
            onBlur={() => flushRef.current()}
          />
        </div>
        {titleInvalid && (
          <p className="field-error" role="alert">
            A title is required; changes are paused until you add one.
          </p>
        )}

        <dl className="props">
          <div className="prop">
            <dt>
              <StatusIcon status={draft.status} /> Status
            </dt>
            <dd>
              <Select variant="ghost" label="Status" value={draft.status} onChange={setStatus} options={opts.status} />
            </dd>
          </div>
          <div className="prop">
            <dt>
              <Icon name="flag" size={15} /> Priority
            </dt>
            <dd>
              <Select variant="ghost" label="Priority" value={draft.priority} onChange={(v) => commit({ priority: v })} options={opts.priority} />
            </dd>
          </div>
          <div className="prop">
            <dt>
              <Icon name="person" size={14} /> Assignee
            </dt>
            <dd>
              <Select variant="ghost" label="Assignee" value={draft.assignee} onChange={(v) => commit({ assignee: v })} options={opts.members} />
            </dd>
          </div>
          <div className="prop">
            <dt>
              <Icon name="tag" size={14} /> Label
            </dt>
            <dd>
              <Select variant="ghost" label="Label" value={draft.tag} onChange={(v) => commit({ tag: v })} options={opts.tags} />
            </dd>
          </div>
          <div className="prop">
            <dt>
              <Icon name="points" size={14} /> Points
            </dt>
            <dd>
              <div className="points-picker" role="radiogroup" aria-label="Story points">
                {board.storyPoints.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={draft.points === p}
                    className={`point${draft.points === p ? ' is-on' : ''}`}
                    onClick={() => commit({ points: p })}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </dd>
          </div>
          <div className="prop">
            <dt>
              <Icon name="calendar" size={14} /> Due
            </dt>
            <dd>
              <input
                type="date"
                className="select"
                min="2000-01-01"
                max="2100-12-31"
                value={draft.dueDate ?? ''}
                onChange={(e) => commit({ dueDate: e.target.value || null }, { debounce: true })}
                aria-label="Due date"
              />
            </dd>
          </div>
        </dl>

        <section className="subtasks" aria-labelledby="subtasks-title">
          <div className="section-head">
            <h3 id="subtasks-title">
              <Icon name="checklist" size={14} /> Subtasks
            </h3>
            {subtasks.length > 0 && (
              <span className="section-meta">
                {subDone}/{subtasks.length}
              </span>
            )}
          </div>
          {subtasks.length > 0 && (
            <div className="meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Subtasks complete">
              <span className="meter-fill" style={{ inlineSize: `${pct}%` }} />
            </div>
          )}
          <ul className="subtask-list">
            {subtasks.map((s, i) => (
              <li key={s.id} className={`subtask${s.done ? ' is-done' : ''}`}>
                <input
                  type="checkbox"
                  className="subtask-check"
                  checked={s.done}
                  aria-label={`Done: ${s.text}`}
                  onChange={() => commit({ subtasks: subtasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })}
                />
                <span className="subtask-text">{s.text}</span>
                <button
                  type="button"
                  className="icon-btn icon-btn--xs"
                  aria-label={`Remove subtask: ${s.text}`}
                  onClick={() => commit({ subtasks: subtasks.filter((_, j) => j !== i) })}
                >
                  <Icon name="close" size={12} />
                </button>
              </li>
            ))}
          </ul>
          {subtasks.length < LIMITS.subtasks && (
            <div className="subtask-add">
              <Icon name="plus" size={14} />
              <input
                type="text"
                className="subtask-input"
                placeholder="Add a subtask"
                aria-label="New subtask"
                maxLength={LIMITS.subtask}
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSubtask()
                  }
                }}
              />
            </div>
          )}
        </section>

        <section className="notes">
          <label className="section-head" htmlFor="insp-notes">
            <h3>
              <Icon name="note" size={14} /> Notes
            </h3>
            <span className="section-meta">
              {draft.description.length}/{LIMITS.description}
            </span>
          </label>
          <textarea
            id="insp-notes"
            className="textarea"
            rows={6}
            maxLength={LIMITS.description}
            placeholder="Scope, edge cases, acceptance criteria…"
            value={draft.description}
            onChange={(e) => commit({ description: e.target.value }, { debounce: true })}
            onBlur={() => flushRef.current()}
          />
        </section>

        <footer className="inspector-foot">
          <span>Created {new Date(task.createdAt).toLocaleString()}</span>
          <span>Updated {new Date(task.updatedAt).toLocaleString()}</span>
        </footer>
      </div>
    </aside>
  )
}
