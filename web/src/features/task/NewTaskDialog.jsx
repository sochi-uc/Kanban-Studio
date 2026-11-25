import { useEffect, useMemo, useRef, useState } from 'react'
import { memberOptions, pointOptions, priorityOptions, statusOptions, tagOptions } from '../../lib/options'
import Select from '../../ui/Select'
import Dialog from '../../ui/Dialog'

function blank(lane, board, defaultAssignee) {
  return {
    title: '',
    description: '',
    status: lane,
    priority: 'medium',
    points: 3,
    assignee: defaultAssignee ?? board.members[0]?.name ?? 'Unassigned',
    tag: board.tags[0],
    dueDate: '',
    subtasks: [],
  }
}

export default function NewTaskDialog({ open, lane, board, defaultAssignee, onClose, onCreate }) {
  const [form, setForm] = useState(() => blank(lane, board, defaultAssignee))
  const [busy, setBusy] = useState(false)
  const titleRef = useRef(null)
  const opts = useMemo(
    () => ({
      status: statusOptions(board.lanes),
      priority: priorityOptions(),
      members: memberOptions(board.members),
      tags: tagOptions(board.tags),
      points: pointOptions(board.storyPoints),
    }),
    [board],
  )

  useEffect(() => {
    if (open) setForm(blank(lane, board, defaultAssignee))
    // Reset only when the dialog opens, not on every board refresh while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lane])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (!form.title.trim() || busy) return
    setBusy(true)
    await onCreate({ ...form, points: Number(form.points) })
    setBusy(false)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New task"
      initialFocusRef={titleRef}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="new-task" className="btn btn--primary" aria-busy={busy} disabled={!form.title.trim()}>
            {busy ? 'Creating…' : 'Create task'}
          </button>
        </>
      }
    >
      <form id="new-task" className="form-grid" onSubmit={submit}>
        <label className="field field--full">
          <span className="field-label">Title</span>
          <input ref={titleRef} className="input" required maxLength={200} value={form.title} onChange={set('title')} placeholder="What needs doing?" />
        </label>
        <label className="field field--full">
          <span className="field-label">Notes</span>
          <textarea className="textarea" rows={3} maxLength={4000} value={form.description} onChange={set('description')} placeholder="Scope and acceptance criteria" />
        </label>
        <div className="field">
          <span className="field-label">Status</span>
          <Select label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={opts.status} />
        </div>
        <div className="field">
          <span className="field-label">Priority</span>
          <Select label="Priority" value={form.priority} onChange={(v) => setForm((f) => ({ ...f, priority: v }))} options={opts.priority} />
        </div>
        <div className="field">
          <span className="field-label">Assignee</span>
          <Select label="Assignee" value={form.assignee} onChange={(v) => setForm((f) => ({ ...f, assignee: v }))} options={opts.members} />
        </div>
        <div className="field">
          <span className="field-label">Label</span>
          <Select label="Label" value={form.tag} onChange={(v) => setForm((f) => ({ ...f, tag: v }))} options={opts.tags} />
        </div>
        <div className="field">
          <span className="field-label">Story points</span>
          <Select label="Story points" value={form.points} onChange={(v) => setForm((f) => ({ ...f, points: v }))} options={opts.points} />
        </div>
        <label className="field">
          <span className="field-label">Due date</span>
          <input type="date" className="select" min="2000-01-01" max="2100-12-31" value={form.dueDate} onChange={set('dueDate')} />
        </label>
      </form>
    </Dialog>
  )
}
