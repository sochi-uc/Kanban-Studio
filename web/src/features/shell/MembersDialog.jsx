import { useRef, useState } from 'react'
import Dialog from '../../ui/Dialog'
import Icon from '../../ui/Icon'
import { Avatar } from '../../ui/Bits'

export default function MembersDialog({ open, onClose, board, tasks, onAdd, onRemove }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(null)
  const nameRef = useRef(null)

  const openCount = (memberName) => tasks.filter((t) => t.assignee === memberName && t.status !== 'done').length

  async function add(e) {
    e.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    const ok = await onAdd(name.trim(), role.trim())
    setBusy(false)
    if (ok) {
      setName('')
      setRole('')
      nameRef.current?.focus()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="People" initialFocusRef={nameRef}>
      <p className="dialog-lead">People you can assign tasks to on this board.</p>

      <ul className="member-list">
        {board.members.map((m, i) => {
          const count = openCount(m.name)
          return (
            <li key={m.id} className="member-row">
              <Avatar member={m} size="sm" />
              <span className="member-text">
                <span className="member-name">
                  {m.name}
                  {i === 0 && <span className="badge">You</span>}
                </span>
                <span className="member-role">
                  {m.role || 'Member'} · {count} open {count === 1 ? 'task' : 'tasks'}
                </span>
              </span>
              {i > 0 &&
                (confirming === m.id ? (
                  <span className="member-confirm">
                    <button type="button" className="btn btn--sm" onClick={() => setConfirming(null)}>
                      Keep
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--danger"
                      onClick={() => {
                        setConfirming(null)
                        onRemove(m)
                      }}
                    >
                      Remove
                    </button>
                  </span>
                ) : (
                  <button type="button" className="icon-btn" onClick={() => setConfirming(m.id)} aria-label={`Remove ${m.name}`} title={count ? `Their ${count} open tasks become unassigned` : 'Remove'}>
                    <Icon name="trash" size={15} />
                  </button>
                ))}
            </li>
          )
        })}
      </ul>

      <form className="member-add" onSubmit={add}>
        <input ref={nameRef} className="input" placeholder="Name" aria-label="Name" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Role (optional)" aria-label="Role" maxLength={60} value={role} onChange={(e) => setRole(e.target.value)} />
        <button type="submit" className="btn btn--primary" disabled={!name.trim() || busy}>
          Add
        </button>
      </form>
    </Dialog>
  )
}
