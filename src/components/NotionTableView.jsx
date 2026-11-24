/* ============================================================
   NotionTableView.jsx — Notion Database Table View
   
   Platview Sprint Kanban Studio (TickTick + Notion Fusion)
   Architectural Role: Tabular Database View with Inline Status Editing
   ============================================================ */

import { COLUMNS, PRIORITIES, TAGS, ASSIGNEES } from '../data/kanbanData'

export default function NotionTableView({
  tasks,
  onTaskClick,
  onStatusChange,
  onToggleComplete,
  onDeleteTask
}) {
  return (
    <div className="notion-table-container">
      <table className="notion-table">
        <thead>
          <tr>
            <th style={{ width: '40px', textAlign: 'center' }}></th>
            <th style={{ minWidth: '280px' }}>Title</th>
            <th style={{ width: '130px' }}>Status</th>
            <th style={{ width: '110px' }}>Priority</th>
            <th style={{ width: '130px' }}>Assignee</th>
            <th style={{ width: '130px' }}>Tag</th>
            <th style={{ width: '90px', textAlign: 'center' }}>Points</th>
            <th style={{ width: '110px' }}>Subtasks</th>
            <th style={{ width: '110px' }}>Due Date</th>
            <th style={{ width: '40px' }}></th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                No tasks match your filter criteria.
              </td>
            </tr>
          ) : (
            tasks.map(task => {
              const isCompleted = task.status === 'done'
              const currentCol = COLUMNS.find(c => c.key === task.status) || COLUMNS[0]
              const currentPriority = PRIORITIES[task.priority] || PRIORITIES.medium
              const currentAssignee = ASSIGNEES.find(a => a.name === task.assignee) || {
                name: task.assignee,
                initials: '??',
                color: '#64748B',
                bg: '#F1F5F9'
              }
              const subtasks = task.subtasks || []
              const completedSubtasks = subtasks.filter(s => s.done).length

              return (
                <tr key={task.id} className="notion-table-row">
                  {/* Complete Checkbox */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className={`ticktick-check-circle ticktick-check-circle--mini ${isCompleted ? 'ticktick-check-circle--checked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleComplete(task.id)
                      }}
                      title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {isCompleted && <span>✓</span>}
                    </button>
                  </td>

                  {/* Task Title */}
                  <td onClick={() => onTaskClick(task)} className="notion-table-title-cell">
                    <span className={`table-title-text ${isCompleted ? 'table-title-text--done' : ''}`}>
                      {task.title}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td>
                    <select
                      className="notion-status-pill-select"
                      value={task.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => onStatusChange(task.id, e.target.value)}
                      style={{
                        backgroundColor: currentCol.badgeBg,
                        color: currentCol.badgeText
                      }}
                    >
                      {COLUMNS.map(col => (
                        <option key={col.key} value={col.key}>
                          ● {col.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Priority Flag */}
                  <td onClick={() => onTaskClick(task)}>
                    <span
                      className="table-priority-badge"
                      style={{ color: currentPriority.color, backgroundColor: currentPriority.bg }}
                    >
                      {currentPriority.flag} {currentPriority.code}
                    </span>
                  </td>

                  {/* Assignee Chip */}
                  <td onClick={() => onTaskClick(task)}>
                    <div className="table-assignee-chip">
                      <span
                        className="assignee-mini-avatar"
                        style={{ backgroundColor: currentAssignee.bg, color: currentAssignee.color }}
                      >
                        {currentAssignee.initials}
                      </span>
                      <span>{task.assignee}</span>
                    </div>
                  </td>

                  {/* Component Tag */}
                  <td onClick={() => onTaskClick(task)}>
                    <span className="table-tag-badge">
                      {task.tag}
                    </span>
                  </td>

                  {/* Story Points */}
                  <td onClick={() => onTaskClick(task)} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {task.points} pts
                  </td>

                  {/* Subtasks Progress */}
                  <td onClick={() => onTaskClick(task)}>
                    {subtasks.length > 0 ? (
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {completedSubtasks}/{subtasks.length}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>—</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td onClick={() => onTaskClick(task)}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {task.dueDate || '—'}
                    </span>
                  </td>

                  {/* Delete */}
                  <td>
                    <button
                      type="button"
                      className="table-row-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`Delete task #${task.id}?`)) {
                          onDeleteTask(task.id)
                        }
                      }}
                      title="Delete task"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
