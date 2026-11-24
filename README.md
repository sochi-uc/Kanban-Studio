<div align="center">

<img src="web/public/favicon.svg" width="72" alt="" />

# Kanban Studio

**A fast, secure task board with a Liquid Glass interface.**
React 19 · ASP.NET Core 10 · EF Core · ASP.NET Identity

</div>

---

## Features

- **Board, List and Insights** views, with deep links for each view.
- **Drag and drop** between columns. Keyboard users get `Alt + ←/→`; touch devices get explicit move controls.
- **Inline quick-add** in every column, plus a full *New task* dialog (`N`).
- **Task inspector:** status, priority, assignee, label, story points, due date, a checklist and notes. Text autosaves after you pause typing; everything else saves instantly.
- **Undo** for deletes, and **optimistic updates** with automatic rollback if the server says no.
- **People:** add teammates and assign work. Removing a person unassigns their tasks instead of deleting them.
- **Search, filters and sorting,** with active filters shown as removable chips.
- **Light, Dark or Auto** appearance. Press `?` for every keyboard shortcut.
- **Secure by default:** OWASP Top 10 controls, each backed by an automated test.

## Quick start

Requires the .NET 10 SDK and Node 20.19+.

```powershell
npm --prefix web install
```

```powershell
npm --prefix web run build
```

```powershell
dotnet run --project server/src/Kanban.Api --launch-profile http
```

Open **http://localhost:5080** and create an account. Your board comes with a few starter cards that show you around.

For UI work with hot reload, keep the API running and use `npm --prefix web run dev` (http://localhost:5173). Run the tests with `dotnet test server`.

## Project layout

```
web/      React 19 + Vite SPA   (api · state · features · ui · styles)
server/   .NET 10 solution      (Domain → Application → Infrastructure → Api, + Tests)
docs/     Architecture, API, Security, Design, Development guides
```

## Documentation

| Guide | What's inside |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | System diagram, Clean Architecture layers, request lifecycle, state model, performance choices |
| [API reference](docs/API.md) | Every endpoint, payload and error, plus conventions (CSRF header, ProblemDetails, rate limits) |
| [Security](docs/SECURITY.md) | OWASP Top 10 mapping with implementation and test for each control; production checklist |
| [Design system](docs/DESIGN.md) | Liquid Glass material, icon system, colour, buttons, dropdowns, motion |
| [Development](docs/DEVELOPMENT.md) | Local setup, migrations, adding endpoints and dropdowns, code style |

## Why .NET for the backend

ASP.NET Core Minimal APIs are among the fastest mainstream web stacks; a typical request here takes a few milliseconds of server time. ASP.NET Identity also gives battle-tested password hashing, lockout and session handling out of the box. Real-time sync (SignalR), migrations (EF Core) and tracing (OpenTelemetry) are first-party when you need them. Moving off SQLite to PostgreSQL, SQL Server or MySQL is a one-line provider change.

## Security at a glance

Deny-by-default authorization and owner-scoped queries (no IDOR). SameSite=Strict HttpOnly cookies, a CSRF header and an Origin check. Strict CSP with no inline script and no third-party origins. Mass-assignment protection, input caps and rate limiting. PBKDF2 hashing, lockout and anti-enumeration. The build fails on vulnerable NuGet packages. **33 tests** cover it; details in [docs/SECURITY.md](docs/SECURITY.md).
