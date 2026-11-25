import { useMemo } from 'react'
import Icon, { BrandMark } from '../../ui/Icon'
import { Avatar } from '../../ui/Bits'

const THEMES = [
  { key: 'system', label: 'Auto', icon: 'system' },
  { key: 'light', label: 'Light', icon: 'sun' },
  { key: 'dark', label: 'Dark', icon: 'moon' },
]

export default function Sidebar({
  open,
  onClose,
  user,
  board,
  tasks,
  assignee,
  onAssignee,
  tag,
  onTag,
  theme,
  onTheme,
  onNewTask,
  onManageMembers,
  onExport,
  onShortcuts,
  onSignOut,
}) {
  // One pass for every count instead of a filter() per row.
  const counts = useMemo(() => {
    const byMember = new Map()
    const byTag = new Map()
    for (const t of tasks) {
      if (t.status === 'done') continue // counts show open work
      byMember.set(t.assignee, (byMember.get(t.assignee) ?? 0) + 1)
      byTag.set(t.tag, (byTag.get(t.tag) ?? 0) + 1)
    }
    return { byMember, byTag }
  }, [tasks])

  const usedTags = board.tags.filter((t) => counts.byTag.has(t) || tag === t)
  const unassigned = counts.byMember.get('Unassigned') ?? 0

  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <nav className="sidebar glass" aria-label="Workspace">
        <div className="sidebar-head">
          <div className="brand">
            <BrandMark size={30} />
            <span className="brand-name">Kanban Studio</span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Hide sidebar" title="Hide sidebar  [">
            <Icon name="sidebar" />
          </button>
        </div>

        <button type="button" className="btn btn--primary btn--block sidebar-new" onClick={onNewTask}>
          <Icon name="plus" size={15} strokeWidth={2.2} /> New task
        </button>

        <div className="sidebar-scroll">
          <section className="side-group" aria-labelledby="side-people">
            <div className="side-title-row">
              <h2 id="side-people" className="side-title">
                People
              </h2>
              <button type="button" className="link-btn" onClick={onManageMembers}>
                Manage
              </button>
            </div>
            <ul>
              {board.members.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className={`side-item${assignee === m.name ? ' is-active' : ''}`}
                    aria-pressed={assignee === m.name}
                    onClick={() => onAssignee(assignee === m.name ? 'All' : m.name)}
                  >
                    <Avatar member={m} size="xs" />
                    <span className="side-label">{m.name}</span>
                    <span className="side-count">{counts.byMember.get(m.name) || ''}</span>
                  </button>
                </li>
              ))}
              {unassigned > 0 && (
                <li>
                  <button
                    type="button"
                    className={`side-item${assignee === 'Unassigned' ? ' is-active' : ''}`}
                    aria-pressed={assignee === 'Unassigned'}
                    onClick={() => onAssignee(assignee === 'Unassigned' ? 'All' : 'Unassigned')}
                  >
                    <Avatar name="Unassigned" size="xs" />
                    <span className="side-label side-label--muted">Unassigned</span>
                    <span className="side-count">{unassigned}</span>
                  </button>
                </li>
              )}
              {board.members.length === 1 && (
                <li>
                  <button type="button" className="side-item side-item--ghost" onClick={onManageMembers}>
                    <span className="avatar avatar--xs avatar--add" aria-hidden="true">
                      <Icon name="plus" size={11} strokeWidth={2.2} />
                    </span>
                    <span className="side-label">Add teammates</span>
                  </button>
                </li>
              )}
            </ul>
          </section>

          {usedTags.length > 0 && (
            <section className="side-group" aria-labelledby="side-labels">
              <h2 id="side-labels" className="side-title">
                Labels
              </h2>
              <ul>
                {usedTags.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      className={`side-item${tag === t ? ' is-active' : ''}`}
                      aria-pressed={tag === t}
                      onClick={() => onTag(tag === t ? 'All' : t)}
                    >
                      <Icon name="hash" size={14} />
                      <span className="side-label">{t}</span>
                      <span className="side-count">{counts.byTag.get(t) || ''}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="sidebar-foot">
          <button type="button" className="account" popoverTarget="account-menu" aria-haspopup="menu">
            <Avatar name={user.displayName} size="sm" />
            <span className="account-text">
              <span className="account-name">{user.displayName}</span>
              <span className="account-email">{user.email}</span>
            </span>
            <Icon name="more" size={16} />
          </button>

          <div id="account-menu" className="menu glass" popover="auto" role="menu" aria-label="Account">
            <div className="menu-section" role="none">
              <span className="menu-label" role="none">
                Appearance
              </span>
              <div className="theme-switch" role="radiogroup" aria-label="Appearance">
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="radio"
                    aria-checked={theme === t.key}
                    className={`theme-option${theme === t.key ? ' is-on' : ''}`}
                    onClick={() => onTheme(t.key)}
                  >
                    <Icon name={t.icon} size={14} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <MenuItem icon="keyboard" label="Keyboard shortcuts" hint="?" onClick={onShortcuts} />
            <MenuItem icon="download" label="Export board (JSON)" onClick={onExport} />
            <div className="menu-sep" role="separator" />
            <MenuItem icon="logout" label="Sign out" onClick={onSignOut} />
          </div>
        </div>
      </nav>
    </>
  )
}

function MenuItem({ icon, label, hint, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      className="menu-item"
      onClick={(e) => {
        e.currentTarget.closest('[popover]')?.hidePopover()
        onClick()
      }}
    >
      <Icon name={icon} size={15} />
      <span>{label}</span>
      {hint && <kbd>{hint}</kbd>}
    </button>
  )
}
