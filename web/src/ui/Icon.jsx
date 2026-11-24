// Icon system
// - Line icons: 24px grid, 1.6 stroke, round caps/joins, optically centred (SF Symbols "regular" feel).
// - StatusIcon / PriorityIcon: purpose-built 16px glyphs so status and priority read by SHAPE,
//   not colour alone (colour-blind safe), the way Linear/Things do it.
// - BrandMark: the app logo, shared by the sidebar, auth screen and favicon.

const PATHS = {
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m19.5 19.5-4.2-4.2" />
    </>
  ),
  board: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" />
      <path d="M9.2 4.5v15M14.8 4.5v15" />
    </>
  ),
  table: (
    <>
      <path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12" />
      <circle cx="4.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="17.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  chart: (
    <>
      <rect x="4" y="12.5" width="3.6" height="7" rx="1.2" />
      <rect x="10.2" y="4.5" width="3.6" height="15" rx="1.2" />
      <rect x="16.4" y="9" width="3.6" height="10.5" rx="1.2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.8" />
      <path d="M12 3v1.6M12 19.4V21M3 12h1.6M19.4 12H21M5.6 5.6l1.15 1.15M17.25 17.25l1.15 1.15M5.6 18.4l1.15-1.15M17.25 6.75l1.15-1.15" />
    </>
  ),
  moon: <path d="M19.5 14.2A7.5 7.5 0 0 1 9.8 4.5a7.5 7.5 0 1 0 9.7 9.7Z" />,
  system: (
    <>
      <rect x="3" y="4.5" width="18" height="12.5" rx="2.5" />
      <path d="M8.5 20.5h7M12 17v3.5" />
    </>
  ),
  sidebar: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="3.5" />
      <path d="M9.5 4.5v15M5.8 8.5h1.2M5.8 11.5h1.2" />
    </>
  ),
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  trash: (
    <>
      <path d="M4.5 6.8h15M9.6 6.8V5.2c0-.7.6-1.2 1.2-1.2h2.4c.7 0 1.2.5 1.2 1.2v1.6" />
      <path d="M6.3 6.8l.9 11.6c.1 1 .9 1.6 1.8 1.6h6c1 0 1.8-.7 1.8-1.6l.9-11.6M10 11v5M14 11v5" />
    </>
  ),
  check: <path d="m5.5 12.5 4 4 9-9.5" />,
  left: <path d="m14.5 6-6 6 6 6" />,
  right: <path d="m9.5 6 6 6-6 6" />,
  down: <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
  chevrons: <path d="m8 9.5 4-4 4 4M8 14.5l4 4 4-4" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3.2v3.4M16 3.2v3.4" />
    </>
  ),
  flag: <path d="M5.5 21V4.8M5.5 4.8c4-2 7 2 13 0v8.4c-6 2-9-2-13 0" />,
  person: (
    <>
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.8 20c.8-3.6 3.7-5.6 7.2-5.6s6.4 2 7.2 5.6" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.6c2 .6 3.2 2.2 3.5 4.9" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12.4V5.5a2 2 0 0 1 2-2h6.9a2 2 0 0 1 1.4.6l6.6 6.6a2 2 0 0 1 0 2.8l-6.9 6.9a2 2 0 0 1-2.8 0L4.1 13.8a2 2 0 0 1-.6-1.4Z" />
      <circle cx="8.5" cy="8.5" r="1.3" />
    </>
  ),
  hash: <path d="M9.8 4 8.2 20M15.8 4l-1.6 16M4.8 9h15M4 15h15" />,
  points: <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5ZM12 12l8-4M12 12 4 8M12 12v8.5" />,
  checklist: <path d="m4 7.2 1.7 1.7L9 5.6M4 15.2l1.7 1.7L9 13.6M12.5 7.5H20M12.5 15.5H20" />,
  note: (
    <>
      <path d="M6 3.5h8.5l4 4V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5Z" />
      <path d="M14.5 3.5v4h4M8.5 12.5h7M8.5 16h4.5" />
    </>
  ),
  logout: <path d="M14 4.5H7a2.5 2.5 0 0 0-2.5 2.5v10A2.5 2.5 0 0 0 7 19.5h7M10.5 12h10M17 8.5l3.5 3.5-3.5 3.5" />,
  download: <path d="M12 4v10.5M7.5 10 12 14.5 16.5 10M5 19.5h14" />,
  alert: (
    <>
      <path d="M10.4 4.6 3.1 17.3A1.8 1.8 0 0 0 4.7 20h14.6a1.8 1.8 0 0 0 1.6-2.7L13.6 4.6a1.8 1.8 0 0 0-3.2 0Z" />
      <path d="M12 9.5v4.2M12 16.8h.01" />
    </>
  ),
  pencil: <path d="M4.5 19.5h3.8L19 8.8a2.7 2.7 0 0 0-3.8-3.8L4.5 15.7v3.8ZM13.8 6.4l3.8 3.8" />,
  keyboard: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="3" />
      <path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M8 14h8" />
    </>
  ),
  more: <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth="3" />,
  inbox: <path d="M3.5 13.5 6.2 5.8a1.5 1.5 0 0 1 1.4-1h8.8a1.5 1.5 0 0 1 1.4 1l2.7 7.7v4.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-4.5ZM3.5 13.5h4.8l1.4 2.5h4.6l1.4-2.5h4.8" />,
  sort: <path d="M7 5v14M4 8l3-3 3 3M17 19V5M14 16l3 3 3-3" />,
  sparkle: <path d="M12 3.5c.6 4.3 2.2 6 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.5 5.9-2.2 6.5-6.5ZM18.5 15.5c.3 1.9 1 2.6 2.9 2.9-1.9.3-2.6 1-2.9 2.9-.3-1.9-1-2.6-2.9-2.9 1.9-.3 2.6-1 2.9-2.9Z" />,
}

export default function Icon({ name, size = 16, className, strokeWidth = 1.6 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}

/** Workflow status by shape: dashed → empty → half → three-quarter → checked. Tinted with --lane. */
export function StatusIcon({ status, size = 14 }) {
  const common = { width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': true, focusable: false, className: `status-icon lane-${status}` }
  switch (status) {
    case 'backlog':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="8" cy="8" r="6" strokeDasharray="2.2 2.6" />
        </svg>
      )
    case 'todo':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="6" />
        </svg>
      )
    case 'in-progress':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4.5a3.5 3.5 0 0 1 0 7Z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'review':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4.5A3.5 3.5 0 1 1 4.5 8H8Z" fill="currentColor" stroke="none" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <path d="m5 8.2 2 2 4-4.2" fill="none" stroke="var(--on-lane, #fff)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

/** Priority by shape: urgent = alert tile, then 3/2/1 filled signal bars. */
export function PriorityIcon({ priority, size = 14 }) {
  const common = { width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': true, focusable: false, className: `prio-icon prio-icon--${priority}` }
  if (priority === 'critical') {
    return (
      <svg {...common}>
        <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" fill="currentColor" />
        <path d="M8 4.6v4.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8" cy="11.3" r="1.05" fill="#fff" />
      </svg>
    )
  }
  const filled = { high: 3, medium: 2, low: 1 }[priority] ?? 0
  return (
    <svg {...common} fill="currentColor">
      {[0, 1, 2].map((i) => (
        <rect key={i} x={2 + i * 4.5} y={10 - i * 3} width="3" height={4 + i * 3} rx="1" opacity={i < filled ? 1 : 0.25} />
      ))}
    </svg>
  )
}

/** App logo: three ascending columns on a gradient tile. */
export function BrandMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" className="brand-svg">
      <defs>
        <linearGradient id="bm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b9bff" />
          <stop offset="1" stopColor="#7b5cff" />
        </linearGradient>
        <linearGradient id="bm-s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#bm-g)" />
      <rect width="32" height="32" rx="9" fill="url(#bm-s)" />
      <rect x="7" y="14" width="4.6" height="11" rx="2" fill="#fff" fillOpacity=".7" />
      <rect x="13.7" y="10" width="4.6" height="15" rx="2" fill="#fff" fillOpacity=".85" />
      <rect x="20.4" y="7" width="4.6" height="18" rx="2" fill="#fff" />
    </svg>
  )
}
