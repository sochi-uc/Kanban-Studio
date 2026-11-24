import { memo } from 'react'
import { PRIORITIES, isOverdue, laneLabel, shortDate } from '../../lib/meta'
import { Avatar, CheckCircle } from '../../ui/Bits'
import Icon, { PriorityIcon } from '../../ui/Icon'

/**
 * Memoised: only cards whose task object changed re-render on a move or edit.
 * Keyboard: Tab to the title, Enter opens, Alt+←/→ moves between columns (drag-and-drop alternative).
 * Shows only what helps triage at a glance; everything else lives in the inspector.
 */
export default memo(function TaskCard({
  task,
  member,
  prevLane,
  nextLane,
  dragging,
  selected,
  dragType,
  onDragStart,
  onDragEnd,
  onOpen,
  onMove,
  onToggleDone,
}) {
  const done = task.status === 'done'
  const subDone = task.subtasks.reduce((n, s) => n + (s.done ? 1 : 0), 0)
  const overdue = isOverdue(task)
  const prio = PRIORITIES[task.priority]
  const showPriority = task.priority === 'critical' || task.priority === 'high'

  return (
    <article
      className={`card${dragging ? ' is-dragging' : ''}${selected ? ' is-selected' : ''}${done ? ' is-done' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(dragType, String(task.id))
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(task.id)
      }}
      onDragEnd={onDragEnd}
      onKeyDown={(e) => {
        if (!e.altKey) return
        if (e.key === 'ArrowLeft' && prevLane) {
          e.preventDefault()
          onMove(task.id, prevLane)
        } else if (e.key === 'ArrowRight' && nextLane) {
          e.preventDefault()
          onMove(task.id, nextLane)
        }
      }}
    >
      <div className="card-top">
        <CheckCircle
          checked={done}
          onToggle={() => onToggleDone(task.id, task.status)}
          label={done ? `Mark “${task.title}” not done` : `Mark “${task.title}” done`}
        />
        {/* Stretched button: the whole card opens the task, but there's only one tab stop. */}
        <button type="button" className="card-title" onClick={() => onOpen(task.id)} aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight">
          {task.title}
        </button>
      </div>

      <div className="card-foot">
        <div className="card-meta">
          {showPriority && (
            <span className={`prio prio--${task.priority}`} title={`${prio.label} priority`}>
              <PriorityIcon priority={task.priority} size={12} />
              {prio.label}
            </span>
          )}
          {task.dueDate && (
            <span className={`meta${overdue ? ' meta--bad' : ''}`} title={overdue ? 'Overdue' : 'Due'}>
              <Icon name="calendar" size={12} />
              {shortDate(task.dueDate)}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className={`meta${subDone === task.subtasks.length ? ' meta--good' : ''}`} title="Subtasks">
              <Icon name="checklist" size={12} />
              {subDone}/{task.subtasks.length}
            </span>
          )}
          <span className="meta meta--tag">{task.tag}</span>
        </div>
        <span className="card-side">
          {/* Touch devices can't drag reliably; explicit move controls appear there only. */}
          <span className="card-move">
            {prevLane && (
              <button type="button" className="icon-btn icon-btn--xs" onClick={() => onMove(task.id, prevLane)} aria-label={`Move to ${laneLabel(prevLane)}`} tabIndex={-1}>
                <Icon name="left" size={13} />
              </button>
            )}
            {nextLane && (
              <button type="button" className="icon-btn icon-btn--xs" onClick={() => onMove(task.id, nextLane)} aria-label={`Move to ${laneLabel(nextLane)}`} tabIndex={-1}>
                <Icon name="right" size={13} />
              </button>
            )}
          </span>
          <span className="card-assignee" title={task.assignee}>
            <Avatar member={member} name={task.assignee} size="xs" />
          </span>
        </span>
      </div>
    </article>
  )
})
