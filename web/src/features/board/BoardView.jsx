import { useCallback, useMemo, useState } from 'react'
import Column from './Column'

export default function BoardView({ lanes, tasks, memberByName, onOpen, onMove, onToggleDone, onQuickCreate, selectedId }) {
  const [draggingId, setDraggingId] = useState(null)

  // Single pass grouping (was one filter() per column per render).
  const byLane = useMemo(() => {
    const map = Object.fromEntries(lanes.map((l) => [l.key, []]))
    for (const t of tasks) map[t.status]?.push(t)
    return map
  }, [lanes, tasks])

  const onDrop = useCallback(
    (laneKey, id) => {
      setDraggingId(null)
      if (id != null) onMove(id, laneKey)
    },
    [onMove],
  )
  const endDrag = useCallback(() => setDraggingId(null), [])

  return (
    <div className="board" aria-label="Sprint board">
      {lanes.map((lane, i) => (
        <Column
          key={lane.key}
          lane={lane}
          prevLane={lanes[i - 1]?.key}
          nextLane={lanes[i + 1]?.key}
          tasks={byLane[lane.key]}
          memberByName={memberByName}
          draggingId={draggingId}
          selectedId={selectedId}
          onDragStart={setDraggingId}
          onDragEnd={endDrag}
          onDrop={onDrop}
          onOpen={onOpen}
          onMove={onMove}
          onToggleDone={onToggleDone}
          onQuickCreate={onQuickCreate}
        />
      ))}
    </div>
  )
}
