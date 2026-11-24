import { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useBoard } from '../../state/useBoard'
import { useHashView } from '../../hooks/useHashView'
import { useHotkeys } from '../../hooks/useHotkeys'
import { laneLabel, matchesQuery, sortTasks } from '../../lib/meta'
import { Spinner } from '../../ui/Bits'
import { ToastRegion, useToasts } from '../../ui/Toasts'
import Icon from '../../ui/Icon'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import MembersDialog from './MembersDialog'
import ShortcutsDialog from './ShortcutsDialog'
import BoardView from '../board/BoardView'
import TaskInspector from '../task/TaskInspector'
import NewTaskDialog from '../task/NewTaskDialog'

// Secondary views are code-split: the board is what loads first.
const TableView = lazy(() => import('../table/TableView'))
const AnalyticsView = lazy(() => import('../analytics/AnalyticsView'))

const wideScreen = () => window.matchMedia('(min-width: 900px)').matches

export default function Workspace({ user, theme, onTheme, onSignOut }) {
  const { toasts, push, dismiss } = useToasts()
  const notifyError = useCallback((err) => push(err.message, { tone: 'error' }), [push])
  const { status, board, tasks, error, actions } = useBoard({ onError: notifyError })

  const [view, navigate] = useHashView()
  const [sidebarOpen, setSidebarOpen] = useState(wideScreen)
  const [query, setQuery] = useState('')
  const [assignee, setAssignee] = useState('All')
  const [tag, setTag] = useState('All')
  const [sort, setSort] = useState('manual')
  const [inspectId, setInspectId] = useState(null)
  const [newTaskLane, setNewTaskLane] = useState(null)
  const [membersOpen, setMembersOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    if (board?.name) document.title = `${board.name} · Kanban Studio`
  }, [board?.name])

  // On small screens the sidebar is an overlay: close it after picking something.
  const closeSidebarIfNarrow = useCallback(() => {
    if (!wideScreen()) setSidebarOpen(false)
  }, [])

  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const visible = useMemo(() => {
    const filtered = tasks.filter(
      (t) =>
        (assignee === 'All' || t.assignee === assignee) &&
        (tag === 'All' || t.tag === tag) &&
        matchesQuery(t, deferredQuery),
    )
    return sortTasks(filtered, sort)
  }, [tasks, assignee, tag, deferredQuery, sort])

  const filtersActive = assignee !== 'All' || tag !== 'All' || query.trim() !== ''
  const clearFilters = useCallback(() => {
    setAssignee('All')
    setTag('All')
    setQuery('')
  }, [])

  const memberByName = useMemo(() => new Map((board?.members ?? []).map((m) => [m.name, m])), [board])
  const inspected = inspectId == null ? null : tasks.find((t) => t.id === inspectId) ?? null

  const openTask = useCallback((id) => setInspectId(id), [])
  const openNew = useCallback((lane = 'todo') => setNewTaskLane(lane), [])

  const moveTask = useCallback(
    async (id, lane) => {
      const ok = await actions.moveTask(id, lane)
      if (ok && lane === 'done') push('Marked as done')
      else if (ok) push(`Moved to ${laneLabel(lane)}`)
    },
    [actions, push],
  )

  const toggleDone = useCallback((id, current) => moveTask(id, current === 'done' ? 'todo' : 'done'), [moveTask])

  const deleteTask = useCallback(
    (task) => {
      if (inspectId === task.id) setInspectId(null)
      const undo = actions.deleteTask(task.id)
      push('Task deleted', { action: { label: 'Undo', onClick: undo } })
    },
    [actions, push, inspectId],
  )

  const quickCreate = useCallback(
    async (lane, title) => {
      const defaultAssignee = assignee !== 'All' ? assignee : board?.members[0]?.name ?? 'Unassigned'
      return Boolean(
        await actions.createTask({
          title,
          status: lane,
          priority: 'medium',
          points: 1,
          assignee: defaultAssignee,
          tag: tag !== 'All' ? tag : board.tags[0],
          subtasks: [],
        }),
      )
    },
    [actions, assignee, tag, board],
  )

  const exportJson = useCallback(() => {
    const payload = { board: board?.name, exportedAt: new Date().toISOString(), members: board?.members, tasks }
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `${(board?.name || 'board').replace(/[^\w-]+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`,
    })
    a.click()
    URL.revokeObjectURL(url)
  }, [board, tasks])

  useHotkeys({
    n: () => openNew('todo'),
    '/': () => searchRef.current?.focus(),
    '?': () => setShortcutsOpen(true),
    '[': () => setSidebarOpen((o) => !o),
    1: () => navigate('board'),
    2: () => navigate('table'),
    3: () => navigate('analytics'),
    escape: () => (inspectId != null ? setInspectId(null) : filtersActive && clearFilters()),
  })

  if (status === 'loading' || status === 'error') {
    return (
      <div className="splash">
        <div className="wallpaper" aria-hidden="true" />
        {status === 'loading' ? (
          <Spinner label="Loading board" />
        ) : (
          <div className="splash-error glass" role="alert">
            <Icon name="alert" size={20} />
            <p>{error?.message ?? 'Could not load your board.'}</p>
            <button type="button" className="btn btn--primary" onClick={() => actions.reload()}>
              Try again
            </button>
          </div>
        )}
      </div>
    )
  }

  const doneCount = tasks.filter((t) => t.status === 'done').length

  return (
    <div className={`app${sidebarOpen ? ' has-sidebar' : ''}${inspected ? ' has-inspector' : ''}`}>
      <div className="wallpaper" aria-hidden="true" />
      <a className="skip-link" href="#main">
        Skip to board
      </a>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        board={board}
        tasks={tasks}
        assignee={assignee}
        onAssignee={(a) => {
          setAssignee(a)
          closeSidebarIfNarrow()
        }}
        tag={tag}
        onTag={(t) => {
          setTag(t)
          closeSidebarIfNarrow()
        }}
        theme={theme}
        onTheme={onTheme}
        onNewTask={() => openNew('todo')}
        onManageMembers={() => setMembersOpen(true)}
        onExport={exportJson}
        onShortcuts={() => setShortcutsOpen(true)}
        onSignOut={onSignOut}
      />

      <main id="main" className="canvas" tabIndex={-1}>
        <Toolbar
          board={board}
          onRename={actions.renameBoard}
          view={view}
          onNavigate={navigate}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          query={query}
          onQuery={setQuery}
          searchRef={searchRef}
          sort={sort}
          onSort={setSort}
          onNewTask={() => openNew('todo')}
          summary={{ total: tasks.length, done: doneCount, shown: visible.length }}
          filters={{ assignee, tag, query: query.trim() }}
          onClearAssignee={() => setAssignee('All')}
          onClearTag={() => setTag('All')}
          onClearQuery={() => setQuery('')}
          onClearFilters={clearFilters}
        />

        {tasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              <Icon name="inbox" size={28} />
            </span>
            <h2>Your board is empty</h2>
            <p>Create your first task to get started.</p>
            <button type="button" className="btn btn--primary" onClick={() => openNew('todo')}>
              <Icon name="plus" size={15} strokeWidth={2.2} /> New task
            </button>
          </div>
        ) : visible.length === 0 && view !== 'analytics' ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              <Icon name="search" size={26} />
            </span>
            <h2>No matching tasks</h2>
            <p>Nothing matches the current search or filters.</p>
            <button type="button" className="btn" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {view === 'board' && (
              <BoardView
                lanes={board.lanes}
                tasks={visible}
                memberByName={memberByName}
                onOpen={openTask}
                onMove={moveTask}
                onToggleDone={toggleDone}
                onQuickCreate={quickCreate}
                selectedId={inspectId}
              />
            )}
            <Suspense fallback={<div className="view-loading"><Spinner /></div>}>
              {view === 'table' && (
                <TableView
                  tasks={visible}
                  lanes={board.lanes}
                  memberByName={memberByName}
                  onOpen={openTask}
                  onMove={moveTask}
                  onToggleDone={toggleDone}
                  onDelete={deleteTask}
                  selectedId={inspectId}
                />
              )}
              {view === 'analytics' && <AnalyticsView board={board} tasks={tasks} />}
            </Suspense>
          </>
        )}
      </main>

      {inspected && (
        <TaskInspector
          key={inspected.id}
          task={inspected}
          board={board}
          memberByName={memberByName}
          onSave={actions.updateTask}
          onMove={moveTask}
          onDelete={deleteTask}
          onClose={() => setInspectId(null)}
        />
      )}

      <NewTaskDialog
        open={newTaskLane !== null}
        lane={newTaskLane ?? 'todo'}
        board={board}
        defaultAssignee={assignee !== 'All' ? assignee : undefined}
        onClose={() => setNewTaskLane(null)}
        onCreate={async (draft) => {
          const saved = await actions.createTask(draft)
          if (saved) {
            setNewTaskLane(null)
            push('Task created')
          }
          return Boolean(saved)
        }}
      />

      <MembersDialog
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        board={board}
        tasks={tasks}
        onAdd={actions.addMember}
        onRemove={async (member) => {
          if (await actions.removeMember(member.id)) {
            if (assignee === member.name) setAssignee('All')
            push(`${member.name} removed`)
          }
        }}
      />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ToastRegion toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
