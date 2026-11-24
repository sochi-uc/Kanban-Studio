/* ============================================================
   KanbanColumn.jsx — Notion-Style Sprint Column Lane
   
   Platview Sprint Kanban Studio (TickTick + Notion Fusion)
   Architectural Role: State Partitioned Lane with Notion Status Pills
   ============================================================ */

import { useState } from 'react'
import KanbanCard from './KanbanCard'

export default function KanbanColumn({
  column,
  tasks,
  onMove,
  onOpenDrawer,
  onDelete,
  onToggleComplete,
  onQuickAdd,
  draggingTaskId,
  onDragStart,
  onDragEnd,
  onDropTask
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const totalPoints = tasks.reduce((sum, t) => sum + (t.points || 0), 0)
  const isWipExceeded = column.wipLimit && tasks.length > column.wipLimit

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!isDragOver) setIsDragOver(true)
  }

  function handleDragLeave(e) {
    if (e.currentTarget.contains(e.relatedTarget)) return
    setIsDragOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragOver(false)
    onDropTask(column.key)
  }

  return (
    <section
      className={`notion-column ${isDragOver ? 'is-drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Notion Column Header */}
      <div className="notion-column-header">
        <div className="notion-col-header-left">
          {/* Status Pill Badge */}
          <span
            className="notion-col-status-pill"
            style={{
              backgroundColor: column.badgeBg,
              color: column.badgeText
            }}
          >
            ● {column.label}
          </span>

          <span className="notion-col-count" title={`${tasks.length} tasks`}>
            {tasks.length}
          </span>

          {column.wipLimit && (
            <span
              className={`notion-wip-pill ${isWipExceeded ? 'notion-wip-pill--exceeded' : ''}`}
              title={isWipExceeded ? `WIP exceeded! Max ${column.wipLimit}` : `WIP limit: ${column.wipLimit}`}
            >
              {tasks.length}/{column.wipLimit} WIP
            </span>
          )}
        </div>

        <div className="notion-col-header-right">
          <span className="notion-col-pts" title="Total Story Points">
            {totalPoints} pts
          </span>

          <button
            type="button"
            className="notion-col-add-btn"
            onClick={() => onQuickAdd(column.key)}
            title={`Add task to ${column.label}`}
          >
            +
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="notion-column-cards">
        {tasks.length === 0 ? (
          <div className="notion-empty-column">
            <span>No tasks in this lane</span>
            <button
              type="button"
              className="notion-empty-add-btn"
              onClick={() => onQuickAdd(column.key)}
            >
              + New
            </button>
          </div>
        ) : (
          tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              onMove={onMove}
              onOpenDrawer={onOpenDrawer}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              prevStatus={column.prev}
              nextStatus={column.next}
              isDragging={draggingTaskId === task.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}

        {/* Bottom "+ New" Action */}
        <button
          type="button"
          className="notion-col-bottom-new"
          onClick={() => onQuickAdd(column.key)}
        >
          <span>+ New</span>
        </button>
      </div>
    </section>
  )
}
