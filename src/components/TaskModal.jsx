/* ============================================================
   TaskModal.jsx — Create & Edit Sprint Task Dialog
   
   Platview Sprint Kanban Studio
   Architectural Role: Task Mutation Form & Validation Layer
   ============================================================ */

import { useState, useEffect } from 'react'
import { COLUMNS, PRIORITIES, TAGS, ASSIGNEES } from '../data/kanbanData'

export default function TaskModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
  onDelete
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    assignee: 'Sochi',
    tag: 'Architecture',
    priority: 'medium',
    points: 3,
    dueDate: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'todo',
        assignee: initialData.assignee || 'Sochi',
        tag: initialData.tag || 'Architecture',
        priority: initialData.priority || 'medium',
        points: initialData.points || 3,
        dueDate: initialData.dueDate || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        assignee: 'Sochi',
        tag: 'Architecture',
        priority: 'medium',
        points: 3,
        dueDate: ''
      })
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!formData.title.trim()) return

    onSave({
      ...(initialData || {}),
      ...formData,
      points: Number(formData.points)
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {mode === 'edit' ? 'Edit Sprint Task' : 'Create New Sprint Task'}
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Task Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">
                Task Title *
              </label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder="e.g. Implement SignalR WebSockets Pipeline"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                autoFocus
              />
            </div>

            {/* Task Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">
                Description / Acceptance Criteria
              </label>
              <textarea
                id="task-desc"
                className="form-textarea"
                placeholder="Detail technical scope, edge cases, and verification criteria..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Status & Priority Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-status">
                  Sprint Lane
                </label>
                <select
                  id="task-status"
                  className="form-select"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  {COLUMNS.map(col => (
                    <option key={col.key} value={col.key}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">
                  Priority
                </label>
                <select
                  id="task-priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                >
                  {Object.entries(PRIORITIES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignee & Tag Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-assignee">
                  Assignee
                </label>
                <select
                  id="task-assignee"
                  className="form-select"
                  value={formData.assignee}
                  onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                >
                  {ASSIGNEES.map(a => (
                    <option key={a.name} value={a.name}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-tag">
                  Component / Tag
                </label>
                <select
                  id="task-tag"
                  className="form-select"
                  value={formData.tag}
                  onChange={e => setFormData({ ...formData, tag: e.target.value })}
                >
                  {TAGS.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Story Points & Due Date Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-points">
                  Story Points (Fibonacci)
                </label>
                <select
                  id="task-points"
                  className="form-select"
                  value={formData.points}
                  onChange={e => setFormData({ ...formData, points: e.target.value })}
                >
                  {[1, 2, 3, 5, 8, 13].map(pt => (
                    <option key={pt} value={pt}>
                      {pt} points
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-duedate">
                  Target Due Date
                </label>
                <input
                  id="task-duedate"
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                className="btn"
                style={{ color: '#DC2626', borderColor: 'rgba(220, 38, 38, 0.3)', marginRight: 'auto' }}
                onClick={() => {
                  onDelete(initialData.id)
                  onClose()
                }}
              >
                Delete Task
              </button>
            )}

            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {mode === 'edit' ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
