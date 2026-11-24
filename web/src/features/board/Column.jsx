import { memo, useRef, useState } from 'react'
import { LANES } from '../../lib/meta'
import Icon, { StatusIcon } from '../../ui/Icon'
import TaskCard from './TaskCard'

const DRAG_TYPE = 'application/x-kanban-task'

/** Inline "add a card" composer: Enter adds and stays open for the next one, Esc closes. */
function Composer({ laneLabel, onCreate, onClose }) {
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    const t = title.trim()
    if (!t || busy) return
    setBusy(true)
    const ok = await onCreate(t)
    setBusy(false)
    if (ok) setTitle('')
  }

  return (
    <div className="composer">
      <textarea
        className="composer-input"
        autoFocus
        rows={2}
        maxLength={200}
        placeholder="Task title"
        aria-label={`New task in ${laneLabel}`}
        value={title}
        onChange={(e) => setTitle(e.target.value.replace(/\n/g, ''))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          } else if (e.key === 'Escape') {
            e.stopPropagation()
            onClose()
          }
        }}
        onBlur={() => !title.trim() && onClose()}
      />
      <div className="composer-actions">
        <button type="button" className="btn btn--primary btn--sm" disabled={!title.trim() || busy} onMouseDown={(e) => e.preventDefault()} onClick={submit}>
          Add task
        </button>
        <button type="button" className="btn btn--sm btn--plain" onClick={onClose}>
          Cancel
        </button>
        <span className="composer-hint">↵ to add</span>
      </div>
    </div>
  )
}

export default memo(function Column({
  lane,
  prevLane,
  nextLane,
  tasks,
  memberByName,
  draggingId,
  selectedId,
  onDragStart,
  onDragEnd,
  onDrop,
  onOpen,
  onMove,
  onToggleDone,
  onQuickCreate,
}) {
  const [over, setOver] = useState(false)
  const [composing, setComposing] = useState(false)
  const listRef = useRef(null)
  const meta = LANES[lane.key]
  const headingId = `lane-${lane.key}`
  const atLimit = lane.wipLimit != null && tasks.length >= lane.wipLimit
  const overLimit = lane.wipLimit != null && tasks.length > lane.wipLimit

  return (
    <section
      className={`column lane-${lane.key}${over ? ' is-over' : ''}`}
      aria-labelledby={headingId}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(DRAG_TYPE)) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (!over) setOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const id = Number(e.dataTransfer.getData(DRAG_TYPE))
        onDrop(lane.key, Number.isInteger(id) && id > 0 ? id : null)
      }}
    >
      <header className="column-head">
        <StatusIcon status={lane.key} size={15} />
        <h2 id={headingId} className="column-title">
          {meta?.label ?? lane.key}
        </h2>
        <span className="column-count" aria-label={`${tasks.length} tasks`}>
          {tasks.length}
        </span>
        {atLimit && (
          <span className={`wip${overLimit ? ' is-over' : ''}`} title={`Work-in-progress limit is ${lane.wipLimit}`}>
            {overLimit && <Icon name="alert" size={11} strokeWidth={2} />}
            {overLimit ? 'Over limit' : 'At limit'}
          </span>
        )}
        <button
          type="button"
          className="icon-btn icon-btn--sm column-add"
          onClick={() => setComposing(true)}
          aria-label={`Add task to ${meta?.label}`}
          title="Add task"
        >
          <Icon name="plus" size={15} />
        </button>
      </header>

      <div className="column-body" ref={listRef}>
        <ol className="column-cards">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                member={memberByName.get(task.assignee)}
                prevLane={prevLane}
                nextLane={nextLane}
                dragging={draggingId === task.id}
                selected={selectedId === task.id}
                dragType={DRAG_TYPE}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onOpen={onOpen}
                onMove={onMove}
                onToggleDone={onToggleDone}
              />
            </li>
          ))}
        </ol>

        {composing ? (
          <Composer
            laneLabel={meta?.label}
            onCreate={async (title) => {
              const ok = await onQuickCreate(lane.key, title)
              if (ok) requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }))
              return ok
            }}
            onClose={() => setComposing(false)}
          />
        ) : (
          <button type="button" className={`column-new${tasks.length === 0 ? ' is-empty' : ''}`} onClick={() => setComposing(true)}>
            <Icon name="plus" size={14} /> {tasks.length === 0 ? 'Add a task' : 'Add task'}
          </button>
        )}
      </div>
    </section>
  )
})
