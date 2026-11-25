# Development guide

## Prerequisites

- .NET SDK **10.0** (`dotnet --list-sdks`)
- Node **20.19+** (`node -v`)

## First run

```powershell
npm --prefix web install
dotnet tool restore --tool-manifest server/dotnet-tools.json
```

## Day-to-day loops

**Full app, production-like.** Build the SPA, then run the API, which serves it:

```powershell
npm --prefix web run build
dotnet run --project server/src/Kanban.Api --launch-profile http
```

Then open http://localhost:5080.

**UI work with hot reload.** Run the API (above), then:

```powershell
npm --prefix web run dev
```

Then open http://localhost:5173. Vite proxies `/api` to `:5080`.

**Backend tests:**

```powershell
dotnet test server
```

The tests boot the real app against a throwaway SQLite file, so they need nothing running.

## Changing the data model

1. Edit the domain (`server/src/Kanban.Domain`) and its EF mapping (`Infrastructure/Persistence/KanbanDbContext.cs`).
2. Add a migration:

   ```powershell
   dotnet ef migrations add <Name> --project server/src/Kanban.Infrastructure --startup-project server/src/Kanban.Api --output-dir Persistence/Migrations
   ```

3. Run the app. Migrations apply at startup.

> **Gotcha:** owned collections (members, subtasks) with client-set `Guid` keys must be mapped with `ValueGeneratedNever()`. Otherwise EF treats new items as existing rows and issues an UPDATE, which fails.

## Adding an endpoint

1. Add the use case to `BoardService` and return `Result<T>`. Never take an owner id from the request.
2. Add the request/response records to `Contracts.cs`. Only include fields the client may set.
3. Map it in `Api/Endpoints/*Endpoints.cs` via `ToHttp(...)`.
4. Add an HTTP test, plus a cross-user 404 test if the endpoint takes an id.
5. Add the call to `web/src/api/client.js` and the action to `state/useBoard.js`.

## Adding a dropdown

Use `ui/Select.jsx` with an option set from `lib/options.jsx`. Don't add a native `<select>`.

```jsx
<Select label="Priority" value={p} onChange={setP} options={priorityOptions()} variant="field" />
```

## Code style

- **C#:** nullable enabled, warnings are errors, `AnalysisLevel latest-recommended`, central package versions.
- **JS:** function components and hooks only. Side effects stay out of reducers and `setState` updaters. Only `api/client.js` calls `fetch`.
- **CSS:** tokens only, with no raw colours outside `tokens.css` and the brand/lane definitions. Put new controls in `controls.css`.

## Resetting local data

Stop the API and delete `server/src/Kanban.Api/App_Data/kanban.db*`. Keep `App_Data/keys` unless you also want to sign everyone out.
