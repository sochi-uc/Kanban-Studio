/* ============================================================
   TickTickSidebar.jsx — TickTick Collapsible Navigation Sidebar
   
   Platview Sprint Kanban Studio (TickTick + Notion Fusion)
   Architectural Role: Hierarchical Navigation, Views & Filters
   ============================================================ */

import { TAGS, ASSIGNEES } from '../data/kanbanData'

export default function TickTickSidebar({
  isCollapsed,
  onToggleCollapse,
  activeView, // 'board' | 'table' | 'csharp' | 'analytics'
  onSelectView,
  selectedAssignee,
  onSelectAssignee,
  selectedTag,
  onSelectTag,
  tasks,
  theme,
  onToggleTheme,
  onOpenNewTask,
  onResetBoard,
  onExportJson
}) {
  const totalTasks = tasks.length
  const backlogCount = tasks.filter(t => t.status === 'backlog').length
  const completedCount = tasks.filter(t => t.status === 'done').length

  if (isCollapsed) {
    return (
      <aside className="ticktick-sidebar ticktick-sidebar--collapsed">
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title="Expand Sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="sidebar-collapsed-icons">
          <button
            type="button"
            className={`sidebar-icon-btn ${activeView === 'board' ? 'active' : ''}`}
            onClick={() => onSelectView('board')}
            title="Sprint Kanban Board"
          >
            ⚡
          </button>
          <button
            type="button"
            className={`sidebar-icon-btn ${activeView === 'table' ? 'active' : ''}`}
            onClick={() => onSelectView('table')}
            title="Database Table View"
          >
            📋
          </button>
          <button
            type="button"
            className={`sidebar-icon-btn ${activeView === 'csharp' ? 'active' : ''}`}
            onClick={() => onSelectView('csharp')}
            title="C# .NET 10 API"
          >
            💻
          </button>
          <button
            type="button"
            className={`sidebar-icon-btn ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => onSelectView('analytics')}
            title="Sprint Velocity & Analytics"
          >
            📊
          </button>
        </div>

        <button
          type="button"
          className="sidebar-theme-btn-mini"
          onClick={onToggleTheme}
          title="Toggle Theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </aside>
    )
  }

  return (
    <aside className="ticktick-sidebar">
      {/* Workspace Profile Header */}
      <div className="sidebar-profile-header">
        <div className="profile-badge">
          <span className="profile-avatar">SC</span>
          <div className="profile-text">
            <span className="profile-name">Sochi Ugoji</span>
            <span className="profile-workspace">Platview · Sprint 7</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title="Collapse Sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      {/* Quick Add Task Button */}
      <div className="sidebar-quick-add-wrap">
        <button
          type="button"
          className="sidebar-quick-add-btn"
          onClick={onOpenNewTask}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Task</span>
          <kbd className="sidebar-kbd">N</kbd>
        </button>
      </div>

      <div className="sidebar-scrollable-body">
        {/* Core Views Section */}
        <div className="sidebar-group">
          <span className="sidebar-group-title">Views</span>
          <ul className="sidebar-nav-list">
            <li>
              <button
                type="button"
                className={`sidebar-nav-item ${activeView === 'board' ? 'sidebar-nav-item--active' : ''}`}
                onClick={() => onSelectView('board')}
              >
                <span className="nav-item-icon">⚡</span>
                <span className="nav-item-label">Sprint 7 Kanban</span>
                <span className="nav-item-badge">{totalTasks}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`sidebar-nav-item ${activeView === 'table' ? 'sidebar-nav-item--active' : ''}`}
                onClick={() => onSelectView('table')}
              >
                <span className="nav-item-icon">📋</span>
                <span className="nav-item-label">Database Table</span>
                <span className="nav-item-badge">{totalTasks}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`sidebar-nav-item ${activeView === 'csharp' ? 'sidebar-nav-item--active' : ''}`}
                onClick={() => onSelectView('csharp')}
              >
                <span className="nav-item-icon">💻</span>
                <span className="nav-item-label">.NET 10 Minimal API</span>
                <span className="nav-item-badge" style={{ color: '#0A84FF' }}>C#</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`sidebar-nav-item ${activeView === 'analytics' ? 'sidebar-nav-item--active' : ''}`}
                onClick={() => onSelectView('analytics')}
              >
                <span className="nav-item-icon">📊</span>
                <span className="nav-item-label">Velocity &amp; Metrics</span>
                <span className="nav-item-badge" style={{ color: '#10B981' }}>{completedCount} done</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Assignees Slicing Section */}
        <div className="sidebar-group">
          <div className="sidebar-group-header">
            <span className="sidebar-group-title">Team Assignees</span>
            {selectedAssignee !== 'All' && (
              <button
                type="button"
                className="sidebar-reset-filter-btn"
                onClick={() => onSelectAssignee('All')}
              >
                Reset
              </button>
            )}
          </div>
          <ul className="sidebar-nav-list">
            <li>
              <button
                type="button"
                className={`sidebar-nav-item ${selectedAssignee === 'All' ? 'sidebar-nav-item--active' : ''}`}
                onClick={() => onSelectAssignee('All')}
              >
                <span className="nav-item-icon">👥</span>
                <span className="nav-item-label">All Members</span>
                <span className="nav-item-badge">{totalTasks}</span>
              </button>
            </li>
            {ASSIGNEES.filter(a => a.name !== 'Unassigned').map(assignee => {
              const count = tasks.filter(t => t.assignee === assignee.name).length
              return (
                <li key={assignee.name}>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${selectedAssignee === assignee.name ? 'sidebar-nav-item--active' : ''}`}
                    onClick={() => onSelectAssignee(assignee.name)}
                  >
                    <span
                      className="nav-item-avatar"
                      style={{ backgroundColor: assignee.bg, color: assignee.color }}
                    >
                      {assignee.initials}
                    </span>
                    <span className="nav-item-label">{assignee.name}</span>
                    <span className="nav-item-badge">{count}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Tag Categories Section */}
        <div className="sidebar-group">
          <div className="sidebar-group-header">
            <span className="sidebar-group-title">Tags &amp; Components</span>
            {selectedTag !== 'All' && (
              <button
                type="button"
                className="sidebar-reset-filter-btn"
                onClick={() => onSelectTag('All')}
              >
                Reset
              </button>
            )}
          </div>
          <ul className="sidebar-nav-list">
            {TAGS.slice(0, 6).map(tag => {
              const count = tasks.filter(t => t.tag === tag).length
              return (
                <li key={tag}>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${selectedTag === tag ? 'sidebar-nav-item--active' : ''}`}
                    onClick={() => onSelectTag(selectedTag === tag ? 'All' : tag)}
                  >
                    <span className="tag-hash">#</span>
                    <span className="nav-item-label">{tag}</span>
                    {count > 0 && <span className="nav-item-badge">{count}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-footer-btn"
          onClick={onToggleTheme}
          title="Toggle Dark / Light Theme (T)"
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>

        <div className="sidebar-footer-row">
          <button
            type="button"
            className="sidebar-footer-link"
            onClick={onExportJson}
            title="Download JSON Backup"
          >
            Export
          </button>
          <span>·</span>
          <button
            type="button"
            className="sidebar-footer-link"
            onClick={onResetBoard}
            title="Reset Board to Seed Data"
          >
            Reset
          </button>
        </div>
      </div>
    </aside>
  )
}
