/* ============================================================
   KanbanHeader.jsx — Studio Navigation, Search & Controls
   
   Platview Sprint Kanban Studio
   Architectural Role: Global Action & Filtering Toolbar
   ============================================================ */

import { useRef, useEffect } from 'react'
import { ASSIGNEES, PRIORITIES, TAGS } from '../data/kanbanData'

export default function KanbanHeader({
  tasks,
  searchQuery,
  onSearchChange,
  selectedAssignee,
  onAssigneeChange,
  selectedPriority,
  onPriorityChange,
  selectedTag,
  onTagChange,
  onResetFilters,
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  onOpenNewTask,
  onOpenAnalytics,
  onExportJson,
  onExportCsv,
  onImportJson,
  onResetBoard
}) {
  const searchInputRef = useRef(null)
  const fileInputRef = useRef(null)

  // Focus search input when '/' is pressed
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

  const totalPoints = tasks.reduce((s, t) => s + (t.points || 0), 0)
  const completedPoints = tasks.filter(t => t.status === 'done').reduce((s, t) => s + (t.points || 0), 0)
  const completionRate = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0

  const hasActiveFilters = searchQuery || selectedAssignee !== 'All' || selectedPriority !== 'All' || selectedTag !== 'All'

  return (
    <header className="studio-header">
      {/* Top Row: Brand, Search, Global Actions */}
      <div className="header-top-row">
        {/* Left: Brand Identity */}
        <div className="header-brand-group">
          <div className="brand-logo-badge" title="Platview Sprint Platform">
            PV
          </div>
          <div className="brand-text-group">
            <div className="brand-title-row">
              <h1 className="brand-title">Platview Sprint Kanban Studio</h1>
              <span className="sprint-badge">Sprint 7</span>
            </div>
            <span className="brand-subtitle">
              .NET 10 Minimal API &amp; React Enterprise State Architecture
            </span>
          </div>
        </div>

        {/* Middle: Real-Time Fuzzy Search */}
        <div className="header-search-wrapper">
          <svg
            className="search-icon"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search tasks, tags, assignees..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
          <kbd className="search-kbd-hint">/</kbd>
        </div>

        {/* Right: Actions */}
        <div className="header-actions-group">
          {/* View Mode Toggle */}
          <div className="view-mode-pill-toggle">
            <button
              type="button"
              className={`view-mode-btn ${activeTab === 'board' ? 'view-mode-btn--active' : ''}`}
              onClick={() => onTabChange('board')}
              title="Interactive 5-Lane Kanban Board"
            >
              <span>Board View</span>
            </button>
            <button
              type="button"
              className={`view-mode-btn ${activeTab === 'csharp' ? 'view-mode-btn--active' : ''}`}
              onClick={() => onTabChange('csharp')}
              title="Inspect ASP.NET Core 10 Clean Architecture Source"
            >
              <span>C# .NET 10 API</span>
            </button>
          </div>

          {/* Analytics Modal Button */}
          <button
            type="button"
            className="btn"
            onClick={onOpenAnalytics}
            title="Open Sprint Velocity & Analytics Dashboard (A)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Analytics</span>
          </button>

          {/* Export / Import Actions */}
          <button
            type="button"
            className="btn"
            onClick={onExportJson}
            title="Export full board to JSON"
          >
            Export JSON
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => fileInputRef.current?.click()}
            title="Import board from JSON backup"
          >
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={onImportJson}
          />

          {/* Reset Board Button */}
          <button
            type="button"
            className="btn"
            onClick={onResetBoard}
            title="Reset board state to initial sprint seed"
          >
            Reset
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="btn btn-icon-only"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode (T)`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          {/* Primary "+ New Task" Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenNewTask}
            title="Create New Sprint Task (N)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Bottom Filter Row: Assignee Pills, Selectors, Live Metrics */}
      <div className="header-filter-row">
        <div className="filter-left-group">
          <span className="filter-label">Assignee:</span>
          <div className="assignee-filter-pills">
            {['All', ...ASSIGNEES.map(a => a.name)].map(name => (
              <button
                key={name}
                type="button"
                className={`filter-pill ${selectedAssignee === name ? 'filter-pill--active' : ''}`}
                onClick={() => onAssigneeChange(name)}
              >
                {name}
              </button>
            ))}
          </div>

          <span className="filter-label" style={{ marginLeft: '6px' }}>Priority:</span>
          <select
            className="filter-select"
            value={selectedPriority}
            onChange={e => onPriorityChange(e.target.value)}
          >
            <option value="All">All Priorities</option>
            {Object.entries(PRIORITIES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <span className="filter-label" style={{ marginLeft: '6px' }}>Tag:</span>
          <select
            className="filter-select"
            value={selectedTag}
            onChange={e => onTagChange(e.target.value)}
          >
            <option value="All">All Tags</option>
            {TAGS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="filter-reset-link"
              onClick={onResetFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Right Stats Pills */}
        <div className="filter-right-stats">
          <span className="stat-pill" title="Total Tasks on Board">
            {tasks.length} tasks
          </span>
          <span className="stat-pill" title="Total Committed Story Points">
            {totalPoints} pts
          </span>
          <span className="stat-pill" style={{ color: '#10B981' }} title="Sprint Completion">
            {completionRate}% completed
          </span>
        </div>
      </div>
    </header>
  )
}
