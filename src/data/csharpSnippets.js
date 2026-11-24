/* ============================================================
   csharpSnippets.js — ASP.NET Core 10 Clean Architecture Source Code
   
   Platview Sprint Kanban Studio
   Architectural Role: Interactive Full-Stack Backend Inspection
   ============================================================ */

export const CSHARP_FILES = [
  {
    id: 'program',
    name: 'Program.cs',
    category: 'Minimal API Host',
    badge: '.NET 10 Host',
    code: `// ============================================================================
// Program.cs — ASP.NET Core 10 Minimal API Host & Pipeline Configuration
// Platview Sprint Platform — Clean Architecture Endpoint Host
// ============================================================================

using Platview.Sprint.Domain.Entities;
using Platview.Sprint.Domain.Repositories;
using Platview.Sprint.Infrastructure.Hubs;
using Platview.Sprint.Infrastructure.Persistence;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Register Core Infrastructure & Repositories
builder.Services.AddDbContext<SprintDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ISprintTaskRepository, SprintTaskRepository>();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173", "https://kanban.platview.internal")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

app.UseCors();

// Map SignalR Real-Time Collaboration Hub
app.MapHub<SprintHub>("/hubs/sprint");

// Grouped Minimal API Route Builder for Sprint Tasks
var sprintGroup = app.MapGroup("/api/v1/sprint/tasks")
                     .WithTags("Sprint Tasks");

// GET /api/v1/sprint/tasks — Hydrate board
sprintGroup.MapGet("/", async (ISprintTaskRepository repo, CancellationToken ct) =>
{
    var tasks = await repo.GetAllAsync(ct);
    return Results.Ok(tasks);
});

// PATCH /api/v1/sprint/tasks/{id}/status — Optimistic Lane Transition
sprintGroup.MapPatch("/{id:int}/status", async (
    int id, 
    UpdateStatusRequest request, 
    ISprintTaskRepository repo,
    IHubContext<SprintHub> hubContext,
    CancellationToken ct) =>
{
    var task = await repo.GetByIdAsync(id, ct);
    if (task is null)
        return Results.NotFound(new { Message = $"Task #{id} not found." });

    // Execute Domain Transition Rules (Throws DomainException on invalid move)
    task.TransitionStatus(request.NewStatus);
    await repo.SaveChangesAsync(ct);

    // Broadcast Real-Time Mutation via SignalR to Connected Teammates
    await hubContext.Clients.All.SendAsync("TaskMoved", new {
        TaskId = task.Id,
        NewStatus = task.Status.ToString().ToLower(),
        UpdatedBy = "Sochi",
        Timestamp = DateTime.UtcNow
    }, ct);

    return Results.Ok(new {
        Id = task.Id,
        Status = task.Status.ToString().ToLower(),
        Assignee = task.Assignee,
        Points = task.StoryPoints,
        SyncedAt = DateTime.UtcNow,
        Server = "ASP.NET Core 10.0-rc1"
    });
});

// POST /api/v1/sprint/tasks — Create New Task
sprintGroup.MapPost("/", async (
    CreateTaskRequest request,
    ISprintTaskRepository repo,
    IHubContext<SprintHub> hubContext,
    CancellationToken ct) =>
{
    var task = SprintTask.Create(
        request.Title,
        request.Description,
        request.Assignee,
        request.Tag,
        request.Priority,
        request.StoryPoints,
        request.DueDate
    );

    await repo.AddAsync(task, ct);
    await repo.SaveChangesAsync(ct);

    await hubContext.Clients.All.SendAsync("TaskCreated", task, ct);
    return Results.Created($"/api/v1/sprint/tasks/{task.Id}", task);
});

app.Run();

public record UpdateStatusRequest(string NewStatus);
public record CreateTaskRequest(
    string Title, 
    string Description, 
    string Assignee, 
    string Tag, 
    string Priority, 
    int StoryPoints, 
    DateTime? DueDate);`
  },
  {
    id: 'entity',
    name: 'SprintTask.cs',
    category: 'Domain Entity',
    badge: 'DDD Aggregate',
    code: `// ============================================================================
// SprintTask.cs — Domain Entity with Encapsulated Business Rules
// Platview Sprint Platform — Domain Layer (Zero External Dependencies)
// ============================================================================

namespace Platview.Sprint.Domain.Entities;

public enum TaskStatus
{
    Backlog,
    Todo,
    InProgress,
    Review,
    Done
}

public class SprintTask
{
    public int Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Assignee { get; private set; } = string.Empty;
    public string Tag { get; private set; } = string.Empty;
    public TaskStatus Status { get; private set; }
    public string Priority { get; private set; } = "Medium";
    public int StoryPoints { get; private set; } = 3;
    public DateTime? DueDate { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private SprintTask() { } // Required for EF Core ORM

    public static SprintTask Create(
        string title, 
        string description, 
        string assignee, 
        string tag, 
        string priority, 
        int storyPoints, 
        DateTime? dueDate)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Task title cannot be empty.", nameof(title));

        if (storyPoints < 1 || storyPoints > 13)
            throw new ArgumentOutOfRangeException(nameof(storyPoints), "Points must follow Fibonacci scale (1-13).");

        return new SprintTask
        {
            Title = title.Trim(),
            Description = description?.Trim() ?? string.Empty,
            Assignee = string.IsNullOrWhiteSpace(assignee) ? "Unassigned" : assignee.Trim(),
            Tag = tag?.Trim() ?? "General",
            Status = TaskStatus.Backlog,
            Priority = priority ?? "Medium",
            StoryPoints = storyPoints,
            DueDate = dueDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void TransitionStatus(string newStatusRaw)
    {
        if (!Enum.TryParse<TaskStatus>(newStatusRaw.Replace("-", ""), true, out var targetStatus))
            throw new InvalidOperationException($"Invalid status string: '{newStatusRaw}'.");

        // Business Rule: Cannot jump directly from Backlog to Done without review
        if (Status == TaskStatus.Backlog && targetStatus == TaskStatus.Done)
            throw new DomainRuleException("Tasks must undergo development and review before completion.");

        Status = targetStatus;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reassign(string newAssignee)
    {
        Assignee = string.IsNullOrWhiteSpace(newAssignee) ? "Unassigned" : newAssignee.Trim();
        UpdatedAt = DateTime.UtcNow;
    }
}`
  },
  {
    id: 'repository',
    name: 'ISprintTaskRepository.cs',
    category: 'Domain Port',
    badge: 'Clean Architecture',
    code: `// ============================================================================
// ISprintTaskRepository.cs — Clean Architecture Port Interface
// Platview Sprint Platform — Decoupled Persistence Contract
// ============================================================================

namespace Platview.Sprint.Domain.Repositories;

using Platview.Sprint.Domain.Entities;

public interface ISprintTaskRepository
{
    Task<IReadOnlyList<SprintTask>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SprintTask?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SprintTask>> GetByAssigneeAsync(string assignee, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SprintTask>> GetByStatusAsync(TaskStatus status, CancellationToken cancellationToken = default);
    Task AddAsync(SprintTask task, CancellationToken cancellationToken = default);
    void Update(SprintTask task);
    void Remove(SprintTask task);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}`
  },
  {
    id: 'signalr',
    name: 'SprintHub.cs',
    category: 'Real-Time Pipeline',
    badge: 'SignalR WebSockets',
    code: `// ============================================================================
// SprintHub.cs — Real-Time SignalR WebSockets Hub
// Platview Sprint Platform — Instant Collaborative Multi-User Sync
// ============================================================================

namespace Platview.Sprint.Infrastructure.Hubs;

using Microsoft.AspNetCore.SignalR;

public class SprintHub : Hub
{
    public async Task JoinSprintGroup(string sprintId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"sprint-{sprintId}");
        await Clients.OthersInGroup($"sprint-{sprintId}").SendAsync("UserJoined", Context.ConnectionId);
    }

    public async Task LeaveSprintGroup(string sprintId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"sprint-{sprintId}");
        await Clients.OthersInGroup($"sprint-{sprintId}").SendAsync("UserLeft", Context.ConnectionId);
    }

    public override async Task OnConnectedAsync()
    {
        // Telemetry Logging for Active WebSocket Session
        var httpContext = Context.GetHttpContext();
        var clientIp = httpContext?.Connection.RemoteIpAddress?.ToString();
        // Ready to stream mutations
        await base.OnConnectedAsync();
    }
}`
  }
]
