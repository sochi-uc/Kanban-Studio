# HTTP API

Base path: `/api`. Request and response bodies are JSON in camelCase.

## Conventions

| Rule | Detail |
|---|---|
| Authentication | ASP.NET Identity cookie (`__Host-kanban` in production, `kanban.sid` in development). HttpOnly, SameSite=Strict, 8 h sliding. |
| CSRF header | Every `POST`/`PUT`/`PATCH`/`DELETE` **must** send `X-Kanban-Client: web`. If an `Origin` header is present it must match the host. Otherwise the response is `403`. |
| Unknown fields | Rejected with `400`. Send only the documented properties. |
| Errors | [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) ProblemDetails. Validation errors carry `errors: { field: [message] }`. |
| Not yours = not found | Ids that don't exist **and** ids that belong to someone else both return `404`. |
| Enums on the wire | Strings, never integers: status `backlog`·`todo`·`in-progress`·`review`·`done`; priority `critical`·`high`·`medium`·`low`. |
| Dates | `dueDate` is `yyyy-MM-dd` (2000–2100) or `null`. Timestamps are ISO-8601 with offset. |
| Rate limits | Auth endpoints: 10 per minute per IP. Everything else: token bucket of 120 burst, +60 every 10 s, per user/IP. Over the limit returns `429`. |
| Caching | API responses are `Cache-Control: no-store`. Each carries `Server-Timing: app;dur=<ms>`. |

## Auth

| Method & path | Body | Success | Errors |
|---|---|---|---|
| `POST /auth/register` | `{ email, password, displayName }` | `200 { email, displayName }` + session cookie. Creates your board. | `400` invalid input; password under 12 characters; email taken (generic message) |
| `POST /auth/login` | `{ email, password }` | `200 { email, displayName }` + session cookie | `401` with an identical message for wrong password, unknown email or lockout |
| `POST /auth/logout` | none | `204` | none |
| `GET /auth/me` | none | `200 { email, displayName }` | `401` |

Five failed logins lock the account for 15 minutes.

## Board

| Method & path | Body | Success |
|---|---|---|
| `GET /board` | none | `200 Board` |
| `PATCH /board` | `{ name }` (1–100 chars) | `200 Board` |
| `POST /board/members` | `{ name, role? }` (name 1–40 chars, unique ignoring case; role ≤ 60; max 25 members) | `200 Board` |
| `DELETE /board/members/{memberId}` | none | `200 Board`. That member's tasks become `Unassigned`. |

```jsonc
// Board
{
  "id": "9b1c…",
  "name": "My board",
  "lanes":   [{ "key": "todo", "wipLimit": 6 }, …],      // fixed order
  "members": [{ "id": "…", "name": "Ada", "role": "Engineer", "initials": "AD", "hue": "green" }],
  "tags":    ["Feature", "Bug", "Design", "Research", "Docs", "Ops", "Security", "Chore"],
  "storyPoints": [1, 2, 3, 5, 8, 13],
  "tasks":   [Task, …]
}
```

## Tasks

| Method & path | Body | Success |
|---|---|---|
| `POST /tasks` | `TaskRequest` | `201 Task` with a `Location` header |
| `PUT /tasks/{id}` | `TaskRequest` (full replace) | `200 Task` |
| `PATCH /tasks/{id}/status` | `{ status }` | `200 Task` |
| `DELETE /tasks/{id}` | none | `204` |

```jsonc
// TaskRequest — every field optional except title; defaults shown
{
  "title": "Ship onboarding",          // required, 1–200 chars after trim
  "description": "",                   // ≤ 4000
  "status": "todo",
  "priority": "medium",
  "points": 3,                         // 1 2 3 5 8 13
  "assignee": "Unassigned",            // a member name or "Unassigned"
  "tag": "Feature",                    // one of board.tags
  "dueDate": null,                     // "yyyy-MM-dd"
  "subtasks": [                        // ≤ 50, order preserved
    { "id": "existing-guid", "text": "Keep me", "done": true },
    { "text": "New one", "done": false } // no id → server assigns one
  ]
}

// Task
{ "id": 42, "title": "…", "description": "…", "status": "review", "priority": "high",
  "points": 5, "assignee": "Ada", "tag": "Feature", "dueDate": "2026-12-01",
  "subtasks": [{ "id": "…", "text": "…", "done": false }],
  "createdAt": "2026-11-24T16:33:30+00:00", "updatedAt": "…" }
```

**Subtask identity:** subtasks sent with a known `id` are updated in place. Anything else is created with a **server-generated** id. A client cannot pick or collide with ids.

## Health

`GET /healthz` returns `200 Healthy`. It is anonymous and not rate-limited.

## Example (PowerShell)

```powershell
$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$h = @{ 'X-Kanban-Client' = 'web' }
Invoke-RestMethod http://localhost:5080/api/auth/login -Method Post -WebSession $s -Headers $h -ContentType 'application/json' -Body '{"email":"you@example.com","password":"your passphrase"}'
Invoke-RestMethod http://localhost:5080/api/board -WebSession $s
```
