import { useMemo, useState } from 'react'
import { LANES, PRIORITIES, PRIORITY_KEYS, isOverdue } from '../../lib/meta'
import { Avatar } from '../../ui/Bits'

// Lane colours come from a categorical palette validated for CVD separation in light and dark
// (see styles/tokens.css --lane-*). Every segment is also labelled, so colour is never the only cue.

function Stat({ label, value, sub }) {
  return (
    <div className="stat surface">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}

function LaneBar({ lanes, rows, total }) {
  const [hover, setHover] = useState(null)
  return (
    <div className="lanebar-wrap">
      <div className="lanebar" role="img" aria-label={rows.map((r) => `${LANES[r.key].label} ${r.points} points`).join(', ')}>
        {rows
          .filter((r) => r.points > 0)
          .map((r) => (
            <span
              key={r.key}
              className={`lanebar-seg lane-${r.key}${hover && hover !== r.key ? ' is-dim' : ''}`}
              style={{ flexGrow: r.points }}
              onPointerEnter={() => setHover(r.key)}
              onPointerLeave={() => setHover(null)}
            />
          ))}
      </div>
      <div className="lanebar-tip" aria-hidden="true">
        {hover ? (
          <>
            <strong>{LANES[hover].label}</strong> {rows.find((r) => r.key === hover).points} of {total} pts ·{' '}
            {rows.find((r) => r.key === hover).count} tasks
          </>
        ) : (
          'Hover a segment for detail'
        )}
      </div>
      <ul className="legend">
        {lanes.map((l) => {
          const r = rows.find((x) => x.key === l.key)
          return (
            <li key={l.key} className={`lane-${l.key}`}>
              <span className="lane-dot" aria-hidden="true" />
              <span className="legend-label">{LANES[l.key].label}</span>
              <span className="legend-value">{r.points} pts</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function AnalyticsView({ board, tasks }) {
  const m = useMemo(() => {
    const total = tasks.reduce((s, t) => s + t.points, 0)
    const done = tasks.reduce((s, t) => s + (t.status === 'done' ? t.points : 0), 0)
    const lanes = board.lanes.map((l) => {
      const inLane = tasks.filter((t) => t.status === l.key)
      return { key: l.key, count: inLane.length, points: inLane.reduce((s, t) => s + t.points, 0) }
    })
    const members = [...board.members, { name: 'Unassigned', role: 'No owner', hue: 'neutral', initials: '–' }].map((mem) => {
      const mine = tasks.filter((t) => t.assignee === mem.name)
      return {
        ...mem,
        count: mine.length,
        points: mine.reduce((s, t) => s + t.points, 0),
        donePoints: mine.reduce((s, t) => s + (t.status === 'done' ? t.points : 0), 0),
      }
    })
    const maxMember = Math.max(1, ...members.map((x) => x.points))
    const priorities = PRIORITY_KEYS.map((k) => ({ key: k, count: tasks.filter((t) => t.priority === k && t.status !== 'done').length }))
    return {
      total,
      done,
      pct: total ? Math.round((done / total) * 100) : 0,
      overdue: tasks.filter(isOverdue).length,
      lanes,
      members: members.filter((x) => x.count > 0 || x.name !== 'Unassigned'),
      maxMember,
      priorities,
    }
  }, [board, tasks])

  return (
    <div className="analytics">
      <div className="stats">
        <Stat label="Completion" value={`${m.pct}%`} sub={`${m.done} of ${m.total} points`} />
        <Stat label="Tasks" value={tasks.length} sub={`${m.lanes.find((l) => l.key === 'done')?.count ?? 0} done`} />
        <Stat label="In flight" value={m.lanes.find((l) => l.key === 'in-progress')?.count ?? 0} sub="in progress" />
        <Stat label="Overdue" value={m.overdue} sub={m.overdue ? 'need attention' : 'all on track'} />
      </div>

      <section className="panel surface">
        <h2 className="panel-title">Story points by lane</h2>
        <LaneBar lanes={board.lanes} rows={m.lanes} total={m.total} />
      </section>

      <div className="panel-grid">
        <section className="panel surface">
          <h2 className="panel-title">Workload</h2>
          <ul className="legend legend--inline" aria-hidden="true">
            <li><span className="swatch swatch--done" /> Done</li>
            <li><span className="swatch swatch--open" /> Remaining</li>
          </ul>
          <table className="workload">
            <caption className="sr-only">Story points per member</caption>
            <thead className="sr-only">
              <tr><th>Member</th><th>Points</th><th>Done</th></tr>
            </thead>
            <tbody>
              {m.members.map((x) => (
                <tr key={x.name}>
                  <th scope="row">
                    <span className="cell-person">
                      <Avatar member={x} name={x.name} size="xs" />
                      {x.name}
                    </span>
                  </th>
                  <td className="workload-bar-cell">
                    <span className="workload-track" style={{ inlineSize: `${(x.points / m.maxMember) * 100}%` }}>
                      {x.donePoints > 0 && <span className="workload-done" style={{ flexGrow: x.donePoints }} />}
                      {x.points - x.donePoints > 0 && <span className="workload-open" style={{ flexGrow: x.points - x.donePoints }} />}
                    </span>
                  </td>
                  <td className="num">
                    {x.donePoints}/{x.points} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel surface">
          <h2 className="panel-title">Open work by priority</h2>
          <ul className="prio-list">
            {m.priorities.map((p) => (
              <li key={p.key}>
                <span className={`prio prio--${p.key}`}>
                  {PRIORITIES[p.key].code} · {PRIORITIES[p.key].label}
                </span>
                <span className="prio-count">{p.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
