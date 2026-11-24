/* ============================================================
   NotionHeader.jsx — Notion Database Header & View Tabs
   
   Platview Sprint Kanban Studio (TickTick + Notion Fusion)
   Architectural Role: Notion Workspace Navigation & View Switcher
   ============================================================ */

import { useRef, useEffect } from 'react'

export default function NotionHeader({
  activeView,
  onSelectView,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  tasksCount,
  totalPoints,
  completedPoints,
  onOpenNewTask,
  onToggleSidebar,
  isSidebarCollapsed
}) {
  const searchInputRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const completionRate = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0

  return (
    <header className="notion-header">
      {/* Top Breadcrumb Row */}
      <div className="notion-breadcrumb-row">
        <div className="breadcrumb-left">
          {isSidebarCollapsed && (
            <button
              type="button"
              className="breadcrumb-sidebar-toggle"
              onClick={onToggleSidebar}
              title="Expand Sidebar"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
          <span className="breadcrumb-item">Platview Technologies</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-item">Sprints</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-item breadcrumb-item--current">⚡ Sprint 7 Engineering</span>
        </div>

        <div className="breadcrumb-right-stats">
          <span className="breadcrumb-stat">{tasksCount} items</span>
          <span className="breadcrumb-stat">{totalPoints} points</span>
          <span className="breadcrumb-stat breadcrumb-stat--accent">{completionRate}% complete</span>
        </div>
      </div>

      {/* Notion Page Title */}
      <div className="notion-title-row">
        <span className="notion-page-icon">⚡</span>
        <h1 className="notion-page-title">Sprint 7 Kanban</h1>
      </div>

      {/* Notion Database Controls & View Tabs Bar */}
      <div className="notion-toolbar-row">
        {/* Left: View Tabs */}
        <div className="notion-view-tabs">
          <button
            type="button"
            className={`notion-view-tab ${activeView === 'board' ? 'notion-view-tab--active' : ''}`}
            onClick={() => onSelectView('board')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="18" rx="1" />
            </svg>
            <span>Board</span>
          </button>

          <button
            type="button"
            className={`notion-view-tab ${activeView === 'table' ? 'notion-view-tab--active' : ''}`}
            onClick={() => onSelectView('table')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span>Table</span>
          </button>

          <button
            type="button"
            className={`notion-view-tab ${activeView === 'csharp' ? 'notion-view-tab--active' : ''}`}
            onClick={() => onSelectView('csharp')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>C# .NET 10</span>
          </button>

          <button
            type="button"
            className={`notion-view-tab ${activeView === 'analytics' ? 'notion-view-tab--active' : ''}`}
            onClick={() => onSelectView('analytics')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Analytics</span>
          </button>
        </div>

        {/* Right: Search, Sort, New Task */}
        <div className="notion-actions-right">
          {/* Search Box */}
          <div className="notion-search-box">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="notion-search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
            <kbd className="notion-kbd">/</kbd>
          </div>

          {/* Sort Menu */}
          <div className="notion-sort-wrap">
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>Sort:</span>
            <select
              className="notion-sort-select"
              value={sortOption}
              onChange={e => onSortChange(e.target.value)}
            >
              <option value="default">Default Order</option>
              <option value="priority">Priority (P0 → P3)</option>
              <option value="points-desc">Points (High → Low)</option>
              <option value="points-asc">Points (Low → High)</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>

          {/* Notion Blue "+ New" Button */}
          <button
            type="button"
            className="notion-new-btn"
            onClick={onOpenNewTask}
            title="Create New Sprint Task (N)"
          >
            <span>+ New</span>
          </button>
        </div>
      </div>
    </header>
  )
}
