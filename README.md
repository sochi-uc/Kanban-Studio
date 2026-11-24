# Platview Sprint Kanban Studio
### Notion & TickTick Architectural Synthesis Edition

> **Production-grade agile task management modeled from TickTick's ergonomic workflows and Notion's minimal database canvas, powered by React 19, Vite, and simulated ASP.NET Core 10 Minimal API telemetry.**

![Platview Sprint Kanban Studio](public/favicon.svg)

---

## 📌 Executive Overview

**Platview Sprint Kanban Studio** is a standalone, production-grade sprint management application created in `FILES/DEV/Kanban-Studio`.

Synthesizing the productivity hallmarks of **TickTick** (collapsible hierarchical navigation, quick task addition, interactive checklists, subtask progress tracking, and right slide-over task inspectors) with **Notion** (clean database views, breadcrumb navigation, pastel status pill badges, database table view, and minimal typography), this project delivers a unified enterprise agile platform.

---

## 🎨 UI Architecture: Notion & TickTick Modeling

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Platview Sprint Kanban Studio                                     │
├──────────────────┬────────────────────────────────────────────────────────────┬───────────────────┤
│ TICKTICK SIDEBAR │                      NOTION CANVAS                         │  TICKTICK DRAWER  │
│ (Collapsible)    │                                                            │ (Slide-Over R)    │
│                  │  Platview / Sprints / ⚡ Sprint 7 Engineering                │                   │
│ 👤 Sochi Ugoji   │  [⊞ Board] [☰ Table] [💻 C# .NET 10] [📊 Analytics]         │ ✕ Close / Delete  │
│ ⚡ Sprint 7      │  [Search...] [Sort: Priority ▾] [+ New Task]               │                   │
│ 📋 Database Table│────────────────────────────────────────────────────────────│ ◯ Complete Task   │
│ 💻 C# .NET 10    │  Live Telemetry: PATCH /api/v1/sprint/tasks/5/status 200 OK│ 🏷️ Properties Grid │
│ 📊 Velocity      │────────────────────────────────────────────────────────────│ 📅 Due Date       │
│                  │  ● Backlog  ● To Do   ● In Progress  ● Review   ● Done     │ 🚩 Priority Flag  │
│ TAGS (#)         │ ┌─────────┐┌─────────┐┌───────────┐ ┌─────────┐┌─────────┐ │ 👤 Assignee      │
│ # Architecture   │ │ Card 9  ││ Card 6  ││ Card 5    │ │ Card 8  ││ Card 1  │ │ 🔢 Story Points  │
│ # Backend API    │ │ [P0]    ││ [P1]    ││ [P0]      │ │ [P2]    ││ [P1]    │ │                   │
│ # Components     │ │ 2 pts   ││ 5 pts   ││ 8 pts     │ │ 3 pts   ││ 5 pts   │ │ ☑️ Subtasks (2/3)│
│ # Client State   │ │         ││         ││ ☑ 1/3     │ │         ││         │ │ [x] API Route   │
│                  │ └─────────┘└─────────┘└───────────┘ └─────────┘└─────────┘ │ [ ] Unit Tests   │
│ ASSIGNEES        │                                                            │ 📝 Notes Editor   │
│ 👤 Sochi (SC)    │                                                            │ ⚡ ASP.NET Sync   │
│ 👤 Adaeze (AO)   │                                                            │                   │
│ 👤 Emeka (EO)    │                                                            │                   │
│ 👤 Funmi (FA)    │                                                            │                   │
│ 🌙 Theme / Reset │                                                            │                   │
└──────────────────┴────────────────────────────────────────────────────────────┴───────────────────┘
```

### 1. Left Tier: Collapsible TickTick Sidebar
- **Profile Header**: User profile badge (`Sochi Ugoji`), workspace status (`Platview · Sprint 7`).
- **Quick Add Action**: Dedicated `+ Add Task` button with <kbd>N</kbd> keyboard hint.
- **Hierarchical Views**:
  - `⚡ Sprint 7 Kanban` (Active 5-lane board)
  - `📋 Database Table` (Notion-style database grid)
  - `💻 .NET 10 Minimal API` (Clean Architecture & DDD C# explorer)
  - `📊 Velocity & Metrics` (Sprint velocity burnup & team workload)
- **Dynamic Tag Slicing**: Tag categories (`#Architecture`, `#Backend API`, `#Components`, etc.) with live task count badges.
- **Team Assignees**: Direct filtering by member with avatar chips (`Sochi`, `Adaeze`, `Emeka`, `Funmi`).
- **Footer**: Notion Dark/Light theme toggle (<kbd>T</kbd>), JSON Export, and Board Reset.

### 2. Center Tier: Notion Page Canvas & Multi-View Switcher
- **Breadcrumb Navigation**: `Platview Technologies / Sprints / ⚡ Sprint 7 Engineering`.
- **Database View Tabs**:
  - `[⊞ Board]`: 5-lane sprint Kanban with pastel status pills, WIP limits, and story point sums.
  - `[☰ Table]`: Full spreadsheet database table with sortable columns, inline status selectors, priority flags, and subtask counters.
  - `[💻 C# .NET 10]`: Multi-tab source explorer (`Program.cs`, `SprintTask.cs`, `ISprintTaskRepository.cs`, `SprintHub.cs`).
  - `[📊 Analytics]`: Real-time sprint burnup, story point completion, and workload distribution.
- **Toolbar**: Notion-style fuzzy search (<kbd>/</kbd>), sorting dropdown, and blue `+ New` button.
- **ASP.NET Core 10 Telemetry HUD**: Live network telemetry monitor displaying HTTP verb (`PATCH`, `POST`, `GET`, `DEL`), endpoint URL, server status (`200 OK`), roundtrip latency ($8\text{--}22\,\text{ms}$), and SignalR WebSocket broadcast status.

### 3. Right Tier: TickTick Slide-Over Task Inspector
- **Instant Status Transition**: Notion pastel pill dropdown for moving across Backlog, To Do, In Progress, Review, and Done.
- **Completion Checkbox**: Animated TickTick circle checkbox that instantly toggles task completion and updates the board.
- **Notion Properties Grid**: Inline editable Due Date, Priority Flag (P0 Red, P1 Orange, P2 Blue, P3 Slate), Assignee, Component Tag, and Story Points (Fibonacci scale).
- **Subtasks & Acceptance Criteria (TickTick Signature)**: Interactive checklist with checkbox toggling, strikethrough styling, dynamic progress bar ($X/Y$ completed, $\%$), and enter-to-add input.
- **Markdown Notes Editor**: Notion-inspired technical documentation notes area.
- **Audit & Telemetry**: Live server timestamp and ASP.NET Core 10 sync telemetry pill.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :---: | :--- |
| <kbd>N</kbd> | Open **Create New Task** modal |
| <kbd>/</kbd> | Focus **Search** bar |
| <kbd>T</kbd> | Toggle **Dark / Light Theme** (Notion Dark vs Notion Light) |
| <kbd>B</kbd> | Toggle between **Board View** and **Table View** |
| <kbd>Esc</kbd> | Close Slide-Over Drawer or Modal |

---

## 📂 Project Structure

```text
Kanban-Studio/
├── index.html                      # HTML5 host with Inter and Fira Code fonts
├── package.json                    # Dependencies (React 19, Vite)
├── vite.config.js                  # Vite configuration with relative base (./)
├── public/                         # Favicon and SVG brand assets
├── dist/                           # Compiled production build (zero-config static bundle)
│   ├── index.html                  # Direct double-clickable production distribution
│   └── assets/                     # Bundled JS and CSS assets
├── src/
│   ├── main.jsx                    # React mounting root
│   ├── App.jsx                     # State container & TickTick/Notion coordinator
│   ├── data/
│   │   ├── kanbanData.js           # 12 seed sprint tasks with subtasks, tags, and assignees
│   │   └── csharpSnippets.js       # Production-grade ASP.NET Core 10 source files
│   ├── components/
│   │   ├── TickTickSidebar.jsx     # Collapsible left navigation sidebar
│   │   ├── NotionHeader.jsx        # Breadcrumbs, database view tabs, search & sort
│   │   ├── NotionTableView.jsx     # Tabular database grid with inline status editing
│   │   ├── KanbanColumn.jsx        # Notion-style column lane with pastel pills & WIP limits
│   │   ├── KanbanCard.jsx          # Draggable card with TickTick checkbox & property chips
│   │   ├── TickTickTaskDrawer.jsx  # Slide-over task inspector with interactive subtask checklist
│   │   ├── TelemetryBar.jsx        # Live ASP.NET Core 10 Minimal API telemetry HUD
│   │   ├── AnalyticsModal.jsx      # Sprint velocity burnup & team workload analytics
│   │   ├── CSharpCodeViewer.jsx    # Interactive multi-file C# Clean Architecture viewer
│   │   └── TaskModal.jsx           # Form modal for task creation
│   └── styles/
│       └── index.css               # Complete Notion + TickTick design system
└── README.md                       # Comprehensive architectural documentation
```

---

## 🚀 Running the Project

### Option 1: Instant Production Preview (No Dev Server Required)
Simply open the built bundle in any web browser:
```bash
# Double-click or open directly:
"C:\Users\sochi\OneDrive - COVENANT UNIVERSITY COMMUNITY\FILES\DEV\Kanban-Studio\dist\index.html"
```

### Option 2: Live Development Server (Vite HMR)
```bash
cd "C:\Users\sochi\OneDrive - COVENANT UNIVERSITY COMMUNITY\FILES\DEV\Kanban-Studio"

# Start Vite dev server
npm run dev
```
The server will start at `http://localhost:5173/`.

### Option 3: Production Build
```bash
npm run build
```

---

## 🛡️ License
Proprietary & Confidential &copy; 2026 Platview Technologies / Sochima Ugoji. All Rights Reserved.
