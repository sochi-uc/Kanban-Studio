/* ============================================================
   KanbanCard.jsx — Notion & TickTick Styled Draggable Task Card
   
   Platview Sprint Kanban Studio (TickTick + Notion Fusion)
   Architectural Role: Interactive Leaf Element with Checkbox & Properties
   ============================================================ */

import { PRIORITIES, ASSIGNEES } from '../data/kanbanData'

export default function KanbanCard({
  task,
  onMove,
  onOpenDrawer,
  onDelete,
  onToggleComplete,
  prevStatus,
  nextStatus,
  isDragging,
  onDragStart,
  onDragEnd
}) {
  const { id, title, description, assignee, tag, priority, points, dueDate, subtasks } = task

  const priorityMeta = PRIORITIES[priority] || PRIORITIES.medium
  const assigneeMeta = ASSIGNEES.find(a => a.name === assignee) || {
    name: assignee,
    initials: assignee ? assignee.substring(0, 2).toUpperCase() : '??',
    color: '#64748B',
    bg: '#F1F5F9'
  }

  const isCompleted = task.status === 'done'
  const subtaskList = subtasks || []
  const completedSubtasks = subtaskList.filter(s => s.done).length

  return (
    <article
      className={`notion-card ${isDragging ? 'is-dragging' : ''} ${isCompleted ? 'notion-card--completed' : ''}`}
      draggable
      onDragStart={e => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onOpenDrawer(task)}
    >
      {/* Top Meta: Checkbox + Title */}
      <div className="notion-card-header">
        {/* TickTick Checkbox on Card */}
        <button
          type="button"
          className={`ticktick-check-circle ticktick-check-circle--card ${isCompleted ? 'ticktick-check-circle--checked' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete(task.id)
          }}
          title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
        >
          {isCompleted && <span>✓</span>}
        </button>

        <h4 className={`notion-card-title ${isCompleted ? 'notion-card-title--done' : ''}`}>
          {title}
        </h4>
      </div>

      {/* Description Snippet (if available) */}
      {description && (
        <p className="notion-card-desc">
          {description}
        </p>
      )}

      {/* Property Badges (Notion-Style Pills) */}
      <div className="notion-card-props">
        {/* Priority Flag */}
        <span
          className="prop-chip prop-chip--priority"
          style={{ color: priorityMeta.color, backgroundColor: priorityMeta.bg }}
          title={priorityMeta.label}
        >
          {priorityMeta.flag} {priorityMeta.code}
        </span>

        {/* Component Tag */}
        <span className="prop-chip prop-chip--tag">
          {tag}
        </span>

        {/* Story Points */}
        <span className="prop-chip prop-chip--points" title="Fibonacci Story Points">
          {points} pts
        </span>

        {/* Subtasks Count (if any) */}
        {subtaskList.length > 0 && (
          <span
            className={`prop-chip prop-chip--subtasks ${completedSubtasks === subtaskList.length ? 'prop-chip--subtasks-complete' : ''}`}
            title="Subtask completion"
          >
            ☑ {completedSubtasks}/{subtaskList.length}
          </span>
        )}

        {/* Due Date (if set) */}
        {dueDate && (
          <span className="prop-chip prop-chip--date" title={`Due: ${dueDate}`}>
            📅 {dueDate.slice(5)}
          </span>
        )}
      </div>

      {/* Card Footer: Assignee Avatar & Shift Actions */}
      <div className="notion-card-footer" onClick={e => e.stopPropagation()}>
        <div className="notion-card-assignee" title={`Assigned to ${assignee}`}>
          <span
            className="assignee-mini-avatar"
            style={{ backgroundColor: assigneeMeta.bg, color: assigneeMeta.color }}
          >
            {assigneeMeta.initials}
          </span>
          <span className="assignee-mini-name">{assignee}</span>
        </div>

        <div className="notion-card-actions">
          {/* Shift Left */}
          {prevStatus && (
            <button
              type="button"
              className="notion-shift-btn"
              onClick={() => onMove(id, prevStatus)}
              title={`Shift left to ${prevStatus}`}
            >
              &larr;
            </button>
          )}

          {/* Shift Right */}
          {nextStatus && (
            <button
              type="button"
              className="notion-shift-btn notion-shift-btn--next"
              onClick={() => onMove(id, nextStatus)}
              title={`Shift right to ${nextStatus}`}
            >
              &rarr;
            </button>
          )}

          {/* Delete Button */}
          <button
            type="button"
            className="notion-shift-btn notion-shift-btn--del"
            onClick={() => {
              if (window.confirm(`Delete task #${id}?`)) {
                onDelete(id)
              }
            }}
            title="Delete task"
          >
            &times;
          </button>
        </div>
      </div>
    </article>
  )
}
