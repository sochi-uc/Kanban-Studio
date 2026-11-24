import { memo, useMemo } from 'react'
import { statusOptions } from '../../lib/options'
import Select from '../../ui/Select'
import { isOverdue, shortDate } from '../../lib/meta'
import { Avatar, CheckCircle, PriorityBadge } from '../../ui/Bits'
import Icon from '../../ui/Icon'

const Row = memo(function Row({ task, statusOpts, member, selected, onOpen, onMove, onToggleDone, onDelete }) {
  const done = task.status === 'done'
  const subDone = task.subtasks.reduce((n, s) => n + (s.done ? 1 : 0), 0)
  return (
    <tr className={`${selected ? 'is-selected' : ''}${done ? ' is-done' : ''}`}>
      <td className="cell-check">
        <CheckCircle size="sm" checked={done} onToggle={() => onToggleDone(task.id, task.status)} label={`Toggle done: ${task.title}`} />
      </td>
      <th scope="row" className="cell-title">
        <button type="button" className="row-title" onClick={() => onOpen(task.id)}>
          {task.title}
        </button>
      </th>
      <td>
        <Select variant="pill" label={`Status of ${task.title}`} value={task.status} onChange={(v) => onMove(task.id, v)} options={statusOpts} className={`lane-${task.status}`} />
      </td>
      <td>
        <PriorityBadge priority={task.priority} />
      </td>
      <td>
        <span className="cell-person">
          <Avatar member={member} name={task.assignee} size="xs" />
          {task.assignee}
        </span>
      </td>
      <td>
        <span className="chip">{task.tag}</span>
      </td>
      <td className="num">{task.points}</td>
      <td className="num">{task.subtasks.length ? `${subDone}/${task.subtasks.length}` : '–'}</td>
      <td className={`num${isOverdue(task) ? ' is-overdue' : ''}`}>{task.dueDate ? shortDate(task.dueDate) : '–'}</td>
      <td className="cell-actions">
        <button type="button" className="icon-btn icon-btn--sm" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}>
          <Icon name="trash" size={14} />
        </button>
      </td>
    </tr>
  )
})

export default function TableView({ tasks, lanes, memberByName, selectedId, onOpen, onMove, onToggleDone, onDelete }) {
  const statusOpts = useMemo(() => statusOptions(lanes), [lanes])
  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="sr-only">Sprint tasks</caption>
        <thead>
          <tr>
            <th scope="col"><span className="sr-only">Done</span></th>
            <th scope="col">Title</th>
            <th scope="col">Status</th>
            <th scope="col">Priority</th>
            <th scope="col">Assignee</th>
            <th scope="col">Label</th>
            <th scope="col" className="num">Points</th>
            <th scope="col" className="num">Subtasks</th>
            <th scope="col" className="num">Due</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={10} className="table-empty">
                No tasks match the current filters.
              </td>
            </tr>
          ) : (
            tasks.map((t) => (
              <Row
                key={t.id}
                task={t}
                statusOpts={statusOpts}
                member={memberByName.get(t.assignee)}
                selected={selectedId === t.id}
                onOpen={onOpen}
                onMove={onMove}
                onToggleDone={onToggleDone}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
