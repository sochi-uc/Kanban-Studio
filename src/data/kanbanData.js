/* ============================================================
   kanbanData.js — Domain Data Definitions & Sprint Task Store
   
   Platview Sprint Kanban Studio (TickTick + Notion Fusion Edition)
   Architectural Role: Canonical Schema & Seed Data Layer
   ============================================================ */

export const COLUMNS = [
  {
    key: 'backlog',
    label: 'Backlog',
    description: 'Upcoming user stories and triage pool',
    dotColor: '#64748B',
    badgeBg: 'rgba(100, 116, 139, 0.14)',
    badgeText: '#475569',
    wipLimit: null,
    prev: null,
    next: 'todo'
  },
  {
    key: 'todo',
    label: 'To Do',
    description: 'Committed tasks ready for active sprint pickup',
    dotColor: '#D97706',
    badgeBg: 'rgba(245, 158, 11, 0.14)',
    badgeText: '#B45309',
    wipLimit: 6,
    prev: 'backlog',
    next: 'in-progress'
  },
  {
    key: 'in-progress',
    label: 'In Progress',
    description: 'Actively in engineering development',
    dotColor: '#2563EB',
    badgeBg: 'rgba(37, 99, 235, 0.14)',
    badgeText: '#1D4ED8',
    wipLimit: 4,
    prev: 'todo',
    next: 'review'
  },
  {
    key: 'review',
    label: 'Code Review & QA',
    description: 'Pull requests, regression audits & automated CI/CD',
    dotColor: '#7C3AED',
    badgeBg: 'rgba(124, 58, 237, 0.14)',
    badgeText: '#6D28D9',
    wipLimit: 3,
    prev: 'in-progress',
    next: 'done'
  },
  {
    key: 'done',
    label: 'Completed',
    description: 'Passed verification and shipped to production',
    dotColor: '#059669',
    badgeBg: 'rgba(5, 150, 105, 0.14)',
    badgeText: '#047857',
    wipLimit: null,
    prev: 'review',
    next: null
  }
]

export const PRIORITIES = {
  critical: { label: 'High Priority (P0)',   code: 'P0', flag: '🚩', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: '#FCA5A5', order: 0 },
  high:     { label: 'Medium Priority (P1)', code: 'P1', flag: '🟧', color: '#F97316', bg: 'rgba(249, 115, 22, 0.12)', border: '#FDBA74', order: 1 },
  medium:   { label: 'Low Priority (P2)',    code: 'P2', flag: '🟦', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', border: '#93C5FD', order: 2 },
  low:      { label: 'No Priority (P3)',     code: 'P3', flag: '⬜', color: '#64748B', bg: 'rgba(100, 116, 139, 0.12)', border: '#CBD5E1', order: 3 }
}

export const TAGS = [
  'Architecture',
  'Backend API',
  'Components',
  'Client State',
  'Full-Stack',
  'Quality Assurance',
  'UI/UX Design',
  'DevOps',
  'Security'
]

export const ASSIGNEES = [
  { name: 'Sochi',   role: 'Lead Architect',   initials: 'SC', color: '#000073', bg: '#EEF2FF', border: '#C7D2FE' },
  { name: 'Adaeze',  role: 'Data Engineer',    initials: 'AO', color: '#05662E', bg: '#F0FDF4', border: '#BBF7D0' },
  { name: 'Emeka',   role: 'Product Designer', initials: 'EO', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
  { name: 'Funmi',   role: 'QA Specialist',    initials: 'FA', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
  { name: 'Unassigned', role: 'Unallocated',   initials: '—',  color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' }
]

export const initialTasks = [
  {
    id: 1,
    title: 'Audit legacy 500-line monolith',
    description: 'Deconstruct legacy monolithic slide renderer into partitioned domain sub-modules.',
    assignee: 'Sochi',
    tag: 'Architecture',
    status: 'done',
    priority: 'high',
    points: 5,
    dueDate: '2026-09-02',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-02T16:30:00Z',
    subtasks: [
      { id: '1-1', text: 'Map component dependencies in legacy index', done: true },
      { id: '1-2', text: 'Benchmark re-render bottlenecks in DevTools', done: true },
      { id: '1-3', text: 'Author migration documentation', done: true }
    ]
  },
  {
    id: 2,
    title: 'Extract static Presentational components',
    description: 'Separate stateless UI leaf elements to eliminate excessive React re-renders.',
    assignee: 'Sochi',
    tag: 'Components',
    status: 'done',
    priority: 'medium',
    points: 3,
    dueDate: '2026-09-03',
    createdAt: '2026-09-01T09:30:00Z',
    updatedAt: '2026-09-03T14:15:00Z',
    subtasks: [
      { id: '2-1', text: 'Extract PipelineCard presentational leaf', done: true },
      { id: '2-2', text: 'Implement React.memo boundary audits', done: true }
    ]
  },
  {
    id: 3,
    title: 'Design team data model (teamData.js)',
    description: 'Author relational schema for sprint team profiles, skillsets, and contribution metrics.',
    assignee: 'Adaeze',
    tag: 'Client State',
    status: 'done',
    priority: 'medium',
    points: 2,
    dueDate: '2026-09-03',
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-03T18:45:00Z',
    subtasks: [
      { id: '3-1', text: 'Define TypeScript/JSDoc interface schemas', done: true },
      { id: '3-2', text: 'Populate canonical seed datasets', done: true }
    ]
  },
  {
    id: 4,
    title: 'Build interactive FormApp state container',
    description: 'Develop structured dynamic input forms with synchronous validation and telemetry.',
    assignee: 'Sochi',
    tag: 'Client State',
    status: 'done',
    priority: 'high',
    points: 5,
    dueDate: '2026-09-04',
    createdAt: '2026-09-02T11:00:00Z',
    updatedAt: '2026-09-04T12:00:00Z',
    subtasks: [
      { id: '4-1', text: 'Build controlled input components', done: true },
      { id: '4-2', text: 'Wire live validation regex error states', done: true },
      { id: '4-3', text: 'Connect submission list view', done: true }
    ]
  },
  {
    id: 5,
    title: 'Connect ASP.NET Core 10 Minimal API status bridge',
    description: 'Wire optimistic status update mutations to simulated ASP.NET Core 10 PATCH endpoints.',
    assignee: 'Sochi',
    tag: 'Backend API',
    status: 'in-progress',
    priority: 'critical',
    points: 8,
    dueDate: '2026-09-06',
    createdAt: '2026-09-03T09:00:00Z',
    updatedAt: '2026-09-05T17:20:00Z',
    subtasks: [
      { id: '5-1', text: 'Define Minimal API PATCH endpoint route', done: true },
      { id: '5-2', text: 'Implement optimistic client rollback on 500 error', done: false },
      { id: '5-3', text: 'Add telemetry latency jitter simulator', done: true }
    ]
  },
  {
    id: 6,
    title: 'Implement SignalR real-time event pipeline',
    description: 'Broadcast task movement and assignment changes across connected client instances via WebSockets.',
    assignee: 'Sochi',
    tag: 'Full-Stack',
    status: 'todo',
    priority: 'high',
    points: 5,
    dueDate: '2026-09-07',
    createdAt: '2026-09-03T14:00:00Z',
    updatedAt: '2026-09-04T10:00:00Z',
    subtasks: [
      { id: '6-1', text: 'Configure SprintHub WebSocket connection hub', done: false },
      { id: '6-2', text: 'Handle automatic reconnection with exponential backoff', done: false }
    ]
  },
  {
    id: 7,
    title: 'End-to-end regression validation cycles',
    description: 'Conduct comprehensive automated UI tests, viewport stress tests, and keyboard navigation audits.',
    assignee: 'Funmi',
    tag: 'Quality Assurance',
    status: 'todo',
    priority: 'medium',
    points: 3,
    dueDate: '2026-09-07',
    createdAt: '2026-09-04T08:30:00Z',
    updatedAt: '2026-09-05T11:15:00Z',
    subtasks: [
      { id: '7-1', text: 'Audit drag-and-drop on mobile touchscreens', done: false },
      { id: '7-2', text: 'Verify ARIA accessibility keyboard traps', done: false }
    ]
  },
  {
    id: 8,
    title: 'Design token alignment with Apple HIG & Notion',
    description: 'Calibrate corner radii, typography hierarchy, optical spacing, and subtle glassmorphic blurs.',
    assignee: 'Emeka',
    tag: 'UI/UX Design',
    status: 'review',
    priority: 'medium',
    points: 3,
    dueDate: '2026-09-06',
    createdAt: '2026-09-04T13:00:00Z',
    updatedAt: '2026-09-06T15:30:00Z',
    subtasks: [
      { id: '8-1', text: 'Align pastel palette tokens for status badges', done: true },
      { id: '8-2', text: 'Refine TickTick slide-over drawer easing', done: true }
    ]
  },
  {
    id: 9,
    title: 'Configure Docker multi-stage build & Redis cache',
    description: 'Optimize container image footprint with alpine runtime and establish distributed cache invalidation.',
    assignee: 'Sochi',
    tag: 'DevOps',
    status: 'backlog',
    priority: 'high',
    points: 5,
    dueDate: '2026-09-10',
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-09-05T09:00:00Z',
    subtasks: [
      { id: '9-1', text: 'Draft Dockerfile.multistage for .NET 10', done: false },
      { id: '9-2', text: 'Configure Redis cache key prefixing', done: false }
    ]
  },
  {
    id: 10,
    title: 'Implement JWT authentication & RBAC policy',
    description: 'Enforce claims-based authorization policies on protected sprint management endpoints.',
    assignee: 'Sochi',
    tag: 'Security',
    status: 'backlog',
    priority: 'critical',
    points: 8,
    dueDate: '2026-09-11',
    createdAt: '2026-09-05T10:30:00Z',
    updatedAt: '2026-09-05T10:30:00Z',
    subtasks: [
      { id: '10-1', text: 'Configure AddAuthentication with JwtBearer', done: false },
      { id: '10-2', text: 'Define SprintAdmin and SprintMember policies', done: false }
    ]
  },
  {
    id: 11,
    title: 'Unit test coverage for domain status machine',
    description: 'Author xUnit test suite ensuring prohibited lane transitions throw DomainExceptions.',
    assignee: 'Adaeze',
    tag: 'Quality Assurance',
    status: 'review',
    priority: 'high',
    points: 3,
    dueDate: '2026-09-07',
    createdAt: '2026-09-05T14:00:00Z',
    updatedAt: '2026-09-06T16:00:00Z',
    subtasks: [
      { id: '11-1', text: 'Assert Backlog -> Done direct transition throws DomainException', done: true },
      { id: '11-2', text: 'Assert state mutation raises DomainEvent', done: true }
    ]
  },
  {
    id: 12,
    title: 'OpenTelemetry distributed tracing pipeline',
    description: 'Instrument MassTransit and Minimal API pipeline with Jaeger tracing and Prometheus metrics.',
    assignee: 'Emeka',
    tag: 'Architecture',
    status: 'todo',
    priority: 'medium',
    points: 5,
    dueDate: '2026-09-08',
    createdAt: '2026-09-05T16:00:00Z',
    updatedAt: '2026-09-06T09:30:00Z',
    subtasks: [
      { id: '12-1', text: 'Wire OpenTelemetry.Extensions.Hosting', done: false },
      { id: '12-2', text: 'Configure OTLP gRPC exporter endpoint', done: false }
    ]
  }
]
