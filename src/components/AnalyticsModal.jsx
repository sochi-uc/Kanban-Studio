/* ============================================================
   AnalyticsModal.jsx — Sprint Velocity & Health Dashboard
   
   Platview Sprint Kanban Studio
   Architectural Role: Sprint Metrics & Workload Distribution Overlay
   ============================================================ */

import { COLUMNS, PRIORITIES, ASSIGNEES } from '../data/kanbanData'

export default function AnalyticsModal({ isOpen, tasks, onClose }) {
  if (!isOpen) return null

  const totalTasks = tasks.length
  const totalPoints = tasks.reduce((s, t) => s + (t.points || 0), 0)
  const completedTasks = tasks.filter(t => t.status === 'done')
  const completedPoints = completedTasks.reduce((s, t) => s + (t.points || 0), 0)
  const completionRate = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📊</span>
            <h3 className="modal-title">Sprint Velocity &amp; Analytics</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Top 4 KPI Metrics */}
          <div className="analytics-grid">
            <div className="metric-card">
              <span className="metric-label">Total Tasks</span>
              <span className="metric-value">{totalTasks}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Committed Pts</span>
              <span className="metric-value">{totalPoints}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Completed Pts</span>
              <span className="metric-value" style={{ color: '#10B981' }}>{completedPoints}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Completion</span>
              <span className="metric-value" style={{ color: '#0071E3' }}>{completionRate}%</span>
            </div>
          </div>

          {/* Overall Sprint Progress Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              <span>Sprint Commitment Burnup</span>
              <span>{completedPoints} of {totalPoints} story points ({completionRate}%)</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          {/* Lane Distribution Breakdown */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
              Lane Distribution
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {COLUMNS.map(col => {
                const laneTasks = tasks.filter(t => t.status === col.key)
                const lanePoints = laneTasks.reduce((s, t) => s + (t.points || 0), 0)
                const lanePct = totalTasks > 0 ? Math.round((laneTasks.length / totalTasks) * 100) : 0
                return (
                  <div key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '140px', flexShrink: 0 }}>
                      <span className="column-dot" style={{ backgroundColor: col.dotColor }} />
                      <span style={{ fontWeight: 600 }}>{col.label}</span>
                    </div>
                    <div className="progress-bar-track" style={{ flex: 1, margin: 0 }}>
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${lanePct}%`, backgroundColor: col.dotColor }}
                      />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', width: '90px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {laneTasks.length} ({lanePoints} pts)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Assignee Workload Breakdown */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
              Team Member Workload Allocation
            </h4>
            <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Team Member</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Role</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>Tasks</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>Points</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {ASSIGNEES.filter(a => a.name !== 'Unassigned').map(assignee => {
                    const memberTasks = tasks.filter(t => t.assignee === assignee.name)
                    const memberPoints = memberTasks.reduce((s, t) => s + (t.points || 0), 0)
                    const memberDone = memberTasks.filter(t => t.status === 'done').length
                    return (
                      <tr key={assignee.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            className="assignee-avatar"
                            style={{ width: '18px', height: '18px', fontSize: '9px', backgroundColor: assignee.bg, color: assignee.color }}
                          >
                            {assignee.initials}
                          </span>
                          <span style={{ fontWeight: 600 }}>{assignee.name}</span>
                        </td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{assignee.role}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{memberTasks.length}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{memberPoints} pts</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#10B981' }}>{memberDone}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
