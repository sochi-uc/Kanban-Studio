/* ============================================================
   App.jsx — Platview Sprint Kanban Studio State Container
   
   TickTick + Notion Aesthetic Architecture
   - Left: Collapsible TickTick Sidebar (Profile, Views, Tags, Assignees)
   - Center: Notion Page Canvas with Database View Switcher (Board, Table, C#, Analytics)
   - Right: TickTick Slide-Over Task Inspector Drawer (Subtasks, Checklists, Properties)
   - Top: Live ASP.NET Core 10 Minimal API Telemetry HUD
   ============================================================ */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { COLUMNS, initialTasks } from './data/kanbanData'
import TickTickSidebar from './components/TickTickSidebar'
import NotionHeader from './components/NotionHeader'
import NotionTableView from './components/NotionTableView'
import KanbanColumn from './components/KanbanColumn'
import TickTickTaskDrawer from './components/TickTickTaskDrawer'
import TelemetryBar from './components/TelemetryBar'
import TaskModal from './components/TaskModal'
import AnalyticsModal from './components/AnalyticsModal'
import CSharpCodeViewer from './components/CSharpCodeViewer'

const STORAGE_KEY = 'platview_kanban_fusion_v3'
const THEME_KEY = 'platview_kanban_theme_fusion'

export default function App() {
  // 1. Tasks State with Lazy Hydration
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : initialTasks
    } catch {
      return initialTasks
    }
  })

  // 2. Theme State (Notion Light vs Notion Dark)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })

  // 3. Navigation View ('board' | 'table' | 'csharp' | 'analytics')
  const [activeView, setActiveView] = useState('board')

  // 4. Sidebar Collapsed State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // 5. Selected Task for TickTick Slide-Over Drawer
  const [drawerTaskId, setDrawerTaskId] = useState(null)

  // 6. Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('All')
  const [selectedTag, setSelectedTag] = useState('All')
  const [sortOption, setSortOption] = useState('default')

  // 7. Drag-and-Drop State
  const [draggingTaskId, setDraggingTaskId] = useState(null)

  // 8. Create Task Modal State
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [quickAddColumnKey, setQuickAddColumnKey] = useState('todo')

  // 9. Toast Notification State
  const [toastMessage, setToastMessage] = useState(null)

  // 10. Simulated ASP.NET Core 10 Telemetry State
  const [telemetry, setTelemetry] = useState({
    active: false,
    verb: 'GET',
    endpoint: '/api/v1/sprint/tasks',
    statusCode: '200 OK',
    latencyMs: 14,
    server: 'ASP.NET Core 10.0-rc1',
    signalRConnected: true
  })

  // Synchronize Theme Attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {}
  }, [theme])

  // Synchronize Tasks to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {}
  }, [tasks])

  // Toast Helper
  const showToast = useCallback((msg) => {
    setToastMessage(msg)
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Telemetry Dispatch Helper
  const dispatchTelemetry = useCallback((verb, endpoint, statusCode = '200 OK') => {
    const latency = Math.floor(Math.random() * 14) + 8
    setTelemetry({
      active: true,
      verb,
      endpoint,
      statusCode,
      latencyMs: latency,
      server: 'ASP.NET Core 10.0-rc1',
      signalRConnected: true
    })

    const timeout = setTimeout(() => {
      setTelemetry(prev => ({ ...prev, active: false }))
    }, 1200)

    return () => clearTimeout(timeout)
  }, [])

  // Keyboard Shortcuts (N, /, T, B, Esc)
  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setQuickAddColumnKey('todo')
        setIsNewTaskModalOpen(true)
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault()
        setActiveView(prev => (prev === 'board' ? 'table' : 'board'))
      } else if (e.key === 'Escape') {
        setDrawerTaskId(null)
        setIsNewTaskModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Move Task (Optimistic Mutation + HTTP PATCH)
  const handleMove = useCallback((taskId, targetStatus) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: targetStatus, updatedAt: new Date().toISOString() }
          : task
      )
    )

    const targetCol = COLUMNS.find(c => c.key === targetStatus)
    dispatchTelemetry('PATCH', `/api/v1/sprint/tasks/${taskId}/status`)
    showToast(`Task #${taskId} moved to ${targetCol?.label || targetStatus}`)
  }, [dispatchTelemetry, showToast])

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e, task) => {
    setDraggingTaskId(task.id)
    e.dataTransfer.setData('text/plain', String(task.id))
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingTaskId(null)
  }, [])

  const handleDropTask = useCallback((targetColumnKey) => {
    if (!draggingTaskId) return
    handleMove(draggingTaskId, targetColumnKey)
    setDraggingTaskId(null)
  }, [draggingTaskId, handleMove])

  // Toggle Task Completion Checkbox (TickTick style)
  const handleToggleComplete = useCallback((taskId) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const nextStatus = task.status === 'done' ? 'todo' : 'done'
          dispatchTelemetry('PATCH', `/api/v1/sprint/tasks/${taskId}/status`)
          showToast(nextStatus === 'done' ? `✓ Completed task #${taskId}!` : `Marked task #${taskId} as To Do`)
          return {
            ...task,
            status: nextStatus,
            updatedAt: new Date().toISOString()
          }
        }
        return task
      })
    )
  }, [dispatchTelemetry, showToast])

  // Update Task Properties from Drawer or Modal
  const handleUpdateTask = useCallback((updatedTask) => {
    setTasks(prev =>
      prev.map(t => (t.id === updatedTask.id ? { ...updatedTask, updatedAt: new Date().toISOString() } : t))
    )
    dispatchTelemetry('PUT', `/api/v1/sprint/tasks/${updatedTask.id}`)
  }, [dispatchTelemetry])

  // Create New Task
  const handleCreateTask = useCallback((newTaskData) => {
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => Number(t.id) || 0)) + 1 : 1
    const task = {
      ...newTaskData,
      id: newId,
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setTasks(prev => [task, ...prev])
    setIsNewTaskModalOpen(false)
    dispatchTelemetry('POST', '/api/v1/sprint/tasks', '201 Created')
    showToast(`Created task #${newId}: "${task.title}"`)
  }, [tasks, dispatchTelemetry, showToast])

  // Delete Task
  const handleDeleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    if (drawerTaskId === taskId) setDrawerTaskId(null)
    dispatchTelemetry('DELETE', `/api/v1/sprint/tasks/${taskId}`, '204 No Content')
    showToast(`Deleted task #${taskId}`)
  }, [drawerTaskId, dispatchTelemetry, showToast])

  // Reset Board State
  const handleResetBoard = useCallback(() => {
    if (window.confirm('Reset board to initial Platview Sprint seed data?')) {
      setTasks(initialTasks)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {}
      dispatchTelemetry('POST', '/api/v1/sprint/tasks/seed')
      showToast('Board reset to seed data')
    }
  }, [dispatchTelemetry, showToast])

  // Export JSON Backup
  const handleExportJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `platview_sprint_kanban_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    showToast('Exported board backup to JSON')
  }, [tasks, showToast])

  // Derived Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesTitle = task.title?.toLowerCase().includes(q)
        const matchesDesc = task.description?.toLowerCase().includes(q)
        const matchesTag = task.tag?.toLowerCase().includes(q)
        const matchesAssignee = task.assignee?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesDesc && !matchesTag && !matchesAssignee) return false
      }

      // Assignee Filter
      if (selectedAssignee !== 'All' && task.assignee !== selectedAssignee) {
        return false
      }

      // Tag Filter
      if (selectedTag !== 'All' && task.tag !== selectedTag) {
        return false
      }

      return true
    })

    // Sorting
    if (sortOption === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      result = [...result].sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2))
    } else if (sortOption === 'points-desc') {
      result = [...result].sort((a, b) => (b.points || 0) - (a.points || 0))
    } else if (sortOption === 'points-asc') {
      result = [...result].sort((a, b) => (a.points || 0) - (b.points || 0))
    } else if (sortOption === 'dueDate') {
      result = [...result].sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    }

    return result
  }, [tasks, searchQuery, selectedAssignee, selectedTag, sortOption])

  // Active Task for TickTick Slide-Over Drawer
  const activeDrawerTask = useMemo(() => {
    return tasks.find(t => t.id === drawerTaskId) || null
  }, [tasks, drawerTaskId])

  const totalPoints = tasks.reduce((s, t) => s + (t.points || 0), 0)
  const completedPoints = tasks.filter(t => t.status === 'done').reduce((s, t) => s + (t.points || 0), 0)

  return (
    <div className="app-layout">
      {/* 1. Left: Collapsible TickTick Navigation Sidebar */}
      <TickTickSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        activeView={activeView}
        onSelectView={setActiveView}
        selectedAssignee={selectedAssignee}
        onSelectAssignee={setSelectedAssignee}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        tasks={tasks}
        theme={theme}
        onToggleTheme={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
        onOpenNewTask={() => {
          setQuickAddColumnKey('todo')
          setIsNewTaskModalOpen(true)
        }}
        onResetBoard={handleResetBoard}
        onExportJson={handleExportJson}
      />

      {/* 2. Center: Notion Main Canvas */}
      <div className="notion-main-canvas">
        {/* Notion Breadcrumbs & Database Views Header */}
        <NotionHeader
          activeView={activeView}
          onSelectView={setActiveView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          tasksCount={tasks.length}
          totalPoints={totalPoints}
          completedPoints={completedPoints}
          onOpenNewTask={() => {
            setQuickAddColumnKey('todo')
            setIsNewTaskModalOpen(true)
          }}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Live ASP.NET Core 10 Minimal API Telemetry Bar */}
        <TelemetryBar telemetry={telemetry} />

        {/* View Switcher: Board vs Table vs C# vs Analytics */}
        {activeView === 'board' && (
          <main className="notion-kanban-viewport">
            <div className="notion-columns-track">
              {COLUMNS.map(column => {
                const columnTasks = filteredTasks.filter(t => t.status === column.key)
                return (
                  <KanbanColumn
                    key={column.key}
                    column={column}
                    tasks={columnTasks}
                    onMove={handleMove}
                    onOpenDrawer={(task) => setDrawerTaskId(task.id)}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                    onQuickAdd={(colKey) => {
                      setQuickAddColumnKey(colKey)
                      setIsNewTaskModalOpen(true)
                    }}
                    draggingTaskId={draggingTaskId}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDropTask={handleDropTask}
                  />
                )
              })}
            </div>
          </main>
        )}

        {activeView === 'table' && (
          <NotionTableView
            tasks={filteredTasks}
            onTaskClick={(task) => setDrawerTaskId(task.id)}
            onStatusChange={handleMove}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeView === 'csharp' && (
          <CSharpCodeViewer />
        )}

        {activeView === 'analytics' && (
          <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
            <AnalyticsModal
              isOpen={true}
              tasks={tasks}
              onClose={() => setActiveView('board')}
            />
          </div>
        )}
      </div>

      {/* 3. Right: TickTick Slide-Over Task Inspector Drawer */}
      <TickTickTaskDrawer
        isOpen={Boolean(activeDrawerTask)}
        task={activeDrawerTask}
        onClose={() => setDrawerTaskId(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Modal: Create Task Dialog */}
      <TaskModal
        isOpen={isNewTaskModalOpen}
        mode="create"
        initialData={{ status: quickAddColumnKey }}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleCreateTask}
        onDelete={handleDeleteTask}
      />

      {/* Transient Action Toast Banner */}
      {toastMessage && (
        <div className="toast-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
