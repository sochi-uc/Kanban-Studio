import { useState } from 'react'
import { sortOptions } from '../../lib/options'
import Select from '../../ui/Select'

const SORT_OPTIONS = sortOptions()
import Icon from '../../ui/Icon'

const SEGMENTS = [
  { key: 'board', label: 'Board', icon: 'board' },
  { key: 'table', label: 'List', icon: 'table' },
  { key: 'analytics', label: 'Insights', icon: 'chart' },
]

function BoardTitle({ name, onRename }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)

  async function save() {
    const next = value.trim()
    setEditing(false)
    if (next && next !== name) {
      if (!(await onRename(next))) setValue(name)
    } else {
      setValue(name)
    }
  }

  if (editing) {
    return (
      <input
        className="page-title page-title--input"
        aria-label="Board name"
        autoFocus
        maxLength={100}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setValue(name)
            setEditing(false)
          }
        }}
      />
    )
  }

  return (
    <h1 className="page-title">
      <button
        type="button"
        className="title-btn"
        onClick={() => {
          setValue(name)
          setEditing(true)
        }}
        title="Rename board"
      >
        {name}
        <Icon name="pencil" size={15} className="title-edit" />
      </button>
    </h1>
  )
}

export default function Toolbar({
  board,
  onRename,
  view,
  onNavigate,
  sidebarOpen,
  onToggleSidebar,
  query,
  onQuery,
  searchRef,
  sort,
  onSort,
  onNewTask,
  summary,
  filters,
  onClearAssignee,
  onClearTag,
  onClearQuery,
  onClearFilters,
}) {
  const activeIndex = SEGMENTS.findIndex((s) => s.key === view)
  const pct = summary.total ? Math.round((summary.done / summary.total) * 100) : 0
  const chips = [
    filters.assignee !== 'All' && { key: 'a', label: filters.assignee, icon: 'person', clear: onClearAssignee },
    filters.tag !== 'All' && { key: 't', label: filters.tag, icon: 'hash', clear: onClearTag },
    filters.query && { key: 'q', label: `“${filters.query}”`, icon: 'search', clear: onClearQuery },
  ].filter(Boolean)

  return (
    <header className="toolbar">
      <div className="toolbar-row">
        <div className="toolbar-title">
          {!sidebarOpen && (
            <button type="button" className="icon-btn glass-btn" onClick={onToggleSidebar} aria-label="Show sidebar" title="Show sidebar  [">
              <Icon name="sidebar" />
            </button>
          )}
          <div className="title-block">
            <BoardTitle key={board.name} name={board.name} onRename={onRename} />
            <div className="progress-line" title={`${summary.done} of ${summary.total} tasks done`}>
              <span className="progress-track" aria-hidden="true">
                <span className="progress-fill" style={{ inlineSize: `${pct}%` }} />
              </span>
              <span className="page-sub">
                {summary.done} of {summary.total} done
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="toolbar-controls glass">
        <div className="segmented" role="tablist" aria-label="View" style={{ '--seg-index': activeIndex, '--seg-count': SEGMENTS.length }}>
          <span className="segmented-lens" aria-hidden="true" />
          {SEGMENTS.map((s) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={view === s.key}
              className="segmented-item"
              onClick={() => onNavigate(s.key)}
            >
              <Icon name={s.icon} size={15} />
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <label className="search">
          <Icon name="search" size={15} />
          <span className="sr-only">Search tasks</span>
          <input
            ref={searchRef}
            type="search"
            placeholder="Search tasks"
            value={query}
            maxLength={100}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onQuery('')
                e.currentTarget.blur()
              }
            }}
          />
          {query ? (
            <button type="button" className="search-clear" onClick={onClearQuery} aria-label="Clear search">
              <Icon name="close" size={12} />
            </button>
          ) : (
            <kbd>/</kbd>
          )}
        </label>

        {view !== 'analytics' && (
          <Select
            variant="pill"
            label="Sort by"
            value={sort}
            onChange={onSort}
            options={SORT_OPTIONS}
            align="end"
            className="sort-dd"
            renderValue={(o) => (
              <>
                <Icon name="sort" size={15} className="dd-lead" />
                <span className="dd-value">{o?.label}</span>
              </>
            )}
          />
        )}

        <button type="button" className="btn btn--primary toolbar-new" onClick={onNewTask} title="New task  N">
          <Icon name="plus" size={15} strokeWidth={2.2} />
          <span>New task</span>
        </button>
      </div>

      {chips.length > 0 && (
        <div className="filter-row" aria-label="Active filters">
          <span className="filter-count">
            Showing {summary.shown} of {summary.total}
          </span>
          {chips.map((c) => (
            <button key={c.key} type="button" className="filter-chip" onClick={c.clear} aria-label={`Remove filter ${c.label}`}>
              <Icon name={c.icon} size={12} />
              {c.label}
              <Icon name="close" size={11} strokeWidth={2.2} />
            </button>
          ))}
          {chips.length > 1 && (
            <button type="button" className="link-btn" onClick={onClearFilters}>
              Clear all
            </button>
          )}
        </div>
      )}
    </header>
  )
}
