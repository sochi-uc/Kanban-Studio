/* ============================================================
   TickTickTaskDrawer.jsx — TickTick Slide-Over Task Inspector
   
   Platview Sprint Kanban Studio (TickTick + Notion Fusion)
   Architectural Role: Rich Task Detail Inspector, Subtasks & Properties
   ============================================================ */

import { useState, useEffect } from 'react'
import { COLUMNS, PRIORITIES, TAGS, ASSIGNEES } from '../data/kanbanData'

export default function TickTickTaskDrawer({
  isOpen,
  task,
  onClose,
  onUpdateTask,
  onDeleteTask
}) {
  const [editedTask, setEditedTask] = useState(null)
  const [newSubtaskText, setNewSubtaskText] = useState('')

  useEffect(() => {
    if (task) {
      setEditedTask({
        ...task,
        subtasks: task.subtasks ? [...task.subtasks] : []
      })
    } else {
      setEditedTask(null)
    }
  }, [task])

  if (!isOpen || !editedTask) return null

  const isCompleted = editedTask.status === 'done'
  const subtasks = editedTask.subtasks || []
  const completedSubtasks = subtasks.filter(s => s.done).length
  const subtasksPct = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0

  function handleFieldChange(field, value) {
    const updated = {
      ...editedTask,
      [field]: value,
      updatedAt: new Date().toISOString()
    }
    setEditedTask(updated)
    onUpdateTask(updated)
  }

  function handleToggleComplete() {
    const nextStatus = isCompleted ? 'todo' : 'done'
    handleFieldChange('status', nextStatus)
  }

  function handleToggleSubtask(subtaskId) {
    const updatedSubtasks = subtasks.map(s =>
      s.id === subtaskId ? { ...s, done: !s.done } : s
    )
    handleFieldChange('subtasks', updatedSubtasks)
  }

  function handleAddSubtask(e) {
    if (e.key === 'Enter' && newSubtaskText.trim()) {
      e.preventDefault()
      const newSubtask = {
        id: `${editedTask.id}-${Date.now()}`,
        text: newSubtaskText.trim(),
        done: false
      }
      const updatedSubtasks = [...subtasks, newSubtask]
      setNewSubtaskText('')
      handleFieldChange('subtasks', updatedSubtasks)
    }
  }

  function handleDeleteSubtask(subtaskId) {
    const updatedSubtasks = subtasks.filter(s => s.id !== subtaskId)
    handleFieldChange('subtasks', updatedSubtasks)
  }

  const currentCol = COLUMNS.find(c => c.key === editedTask.status) || COLUMNS[0]
  const currentPriority = PRIORITIES[editedTask.priority] || PRIORITIES.medium

  return (
    <aside className="ticktick-drawer">
      {/* Drawer Header Toolbar */}
      <div className="drawer-header">
        <div className="drawer-header-left">
          {/* Status Dropdown Pill */}
          <select
            className="drawer-status-select"
            value={editedTask.status}
            onChange={e => handleFieldChange('status', e.target.value)}
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
        </div>

        <div className="drawer-header-right">
          <button
            type="button"
            className="drawer-icon-btn drawer-icon-btn--danger"
            onClick={() => {
              if (window.confirm(`Delete task #${editedTask.id}?`)) {
                onDeleteTask(editedTask.id)
                onClose()
              }
            }}
            title="Delete Task"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>

          <button
            type="button"
            className="drawer-icon-btn"
            onClick={onClose}
            title="Close Drawer (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="drawer-body">
        {/* Title Row with Completion Circle (TickTick Signature) */}
        <div className="drawer-title-row">
          <button
            type="button"
            className={`ticktick-check-circle ${isCompleted ? 'ticktick-check-circle--checked' : ''}`}
            onClick={handleToggleComplete}
            title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
          >
            {isCompleted && <span>✓</span>}
          </button>

          <input
            type="text"
            className={`drawer-title-input ${isCompleted ? 'drawer-title-input--strikethrough' : ''}`}
            value={editedTask.title}
            onChange={e => handleFieldChange('title', e.target.value)}
            placeholder="Task Title"
          />
        </div>

        {/* Notion-Style Properties Grid */}
        <div className="drawer-properties-table">
          {/* Priority Row */}
          <div className="drawer-prop-row">
            <span className="prop-label">
              <span className="prop-icon">🚩</span> Priority
            </span>
            <div className="prop-value">
              <select
                className="prop-select"
                value={editedTask.priority}
                onChange={e => handleFieldChange('priority', e.target.value)}
                style={{ color: currentPriority.color, fontWeight: 600 }}
              >
                {Object.entries(PRIORITIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.flag} {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee Row */}
          <div className="drawer-prop-row">
            <span className="prop-label">
              <span className="prop-icon">👤</span> Assignee
            </span>
            <div className="prop-value">
              <select
                className="prop-select"
                value={editedTask.assignee}
                onChange={e => handleFieldChange('assignee', e.target.value)}
              >
                {ASSIGNEES.map(a => (
                  <option key={a.name} value={a.name}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Component Tag Row */}
          <div className="drawer-prop-row">
            <span className="prop-label">
              <span className="prop-icon">🏷️</span> Component Tag
            </span>
            <div className="prop-value">
              <select
                className="prop-select"
                value={editedTask.tag}
                onChange={e => handleFieldChange('tag', e.target.value)}
              >
                {TAGS.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Story Points Row */}
          <div className="drawer-prop-row">
            <span className="prop-label">
              <span className="prop-icon">🔢</span> Story Points
            </span>
            <div className="prop-value">
              <select
                className="prop-select"
                value={editedTask.points}
                onChange={e => handleFieldChange('points', Number(e.target.value))}
              >
                {[1, 2, 3, 5, 8, 13].map(pt => (
                  <option key={pt} value={pt}>
                    {pt} Story Points
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date Row */}
          <div className="drawer-prop-row">
            <span className="prop-label">
              <span className="prop-icon">📅</span> Due Date
            </span>
            <div className="prop-value">
              <input
                type="date"
                className="prop-date-input"
                value={editedTask.dueDate || ''}
                onChange={e => handleFieldChange('dueDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Subtasks / Checklist Section (TickTick Signature) */}
        <div className="drawer-subtasks-section">
          <div className="subtasks-header">
            <div className="subtasks-title-group">
              <span style={{ fontSize: '14px' }}>☑️</span>
              <span className="subtasks-title">Subtasks / Acceptance Criteria</span>
            </div>
            {subtasks.length > 0 && (
              <span className="subtasks-count">
                {completedSubtasks}/{subtasks.length} ({subtasksPct}%)
              </span>
            )}
          </div>

          {/* Progress bar */}
          {subtasks.length > 0 && (
            <div className="subtask-progress-track">
              <div
                className="subtask-progress-fill"
                style={{ width: `${subtasksPct}%` }}
              />
            </div>
          )}

          {/* Subtask list */}
          <ul className="subtask-items-list">
            {subtasks.map(item => (
              <li key={item.id} className="subtask-item">
                <input
                  type="checkbox"
                  className="subtask-checkbox"
                  checked={item.done}
                  onChange={() => handleToggleSubtask(item.id)}
                />
                <span className={`subtask-text ${item.done ? 'subtask-text--done' : ''}`}>
                  {item.text}
                </span>
                <button
                  type="button"
                  className="subtask-delete-btn"
                  onClick={() => handleDeleteSubtask(item.id)}
                  title="Remove subtask"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>

          {/* Add Subtask Input */}
          <div className="subtask-add-row">
            <span className="subtask-add-plus">+</span>
            <input
              type="text"
              className="subtask-add-input"
              placeholder="Add acceptance criterion or subtask (Press Enter)..."
              value={newSubtaskText}
              onChange={e => setNewSubtaskText(e.target.value)}
              onKeyDown={handleAddSubtask}
            />
          </div>
        </div>

        {/* Technical Description / Notes (Notion-Style) */}
        <div className="drawer-notes-section">
          <label className="notes-label">
            <span>📝</span> Technical Scope &amp; Notes
          </label>
          <textarea
            className="notes-textarea"
            placeholder="Type technical requirements, edge cases, implementation notes..."
            value={editedTask.description || ''}
            onChange={e => handleFieldChange('description', e.target.value)}
            rows={5}
          />
        </div>

        {/* Audit & Server Sync Footer */}
        <div className="drawer-audit-footer">
          <div className="audit-sync-pill">
            <span className="audit-dot" />
            <span>Synced to ASP.NET Core 10 Minimal API · 200 OK</span>
          </div>
          <span className="audit-timestamp">
            Last updated: {new Date(editedTask.updatedAt || Date.now()).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </aside>
  )
}
