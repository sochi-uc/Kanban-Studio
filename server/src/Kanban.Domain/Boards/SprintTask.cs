namespace Kanban.Domain.Boards;

public sealed class SprintTask
{
    private readonly List<Subtask> _subtasks = [];

    private SprintTask() { }

    public int Id { get; private set; }
    public Guid BoardId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Lane Lane { get; private set; }
    public Priority Priority { get; private set; }
    public int Points { get; private set; }
    public string Assignee { get; private set; } = Rules.Unassigned;
    public string Tag { get; private set; } = Rules.Tags[0];
    public DateOnly? DueDate { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public IReadOnlyList<Subtask> Subtasks => _subtasks;

    internal static SprintTask Create(Guid boardId, TaskDetails details, DateTimeOffset now)
    {
        var task = new SprintTask { BoardId = boardId, CreatedAt = now };
        task.Apply(details, now);
        return task;
    }

    internal void Apply(TaskDetails d, DateTimeOffset now)
    {
        var title = (d.Title ?? string.Empty).Trim();
        if (title.Length == 0) throw new DomainException("title", "Title is required.");
        if (title.Length > Rules.TitleMax) throw new DomainException("title", $"Title must be at most {Rules.TitleMax} characters.");

        var description = (d.Description ?? string.Empty).Trim();
        if (description.Length > Rules.DescriptionMax)
            throw new DomainException("description", $"Description must be at most {Rules.DescriptionMax} characters.");

        if (!Enum.IsDefined(d.Lane)) throw new DomainException("status", "Unknown status.");
        if (!Enum.IsDefined(d.Priority)) throw new DomainException("priority", "Unknown priority.");
        if (!Rules.StoryPoints.Contains(d.Points))
            throw new DomainException("points", "Points must be a Fibonacci value: 1, 2, 3, 5, 8 or 13.");
        if (!Rules.Tags.Contains(d.Tag)) throw new DomainException("tag", "Unknown tag.");

        var requested = d.Subtasks ?? [];
        if (requested.Count > Rules.SubtasksMax)
            throw new DomainException("subtasks", $"A task can have at most {Rules.SubtasksMax} subtasks.");
        var texts = requested.Select(s => Subtask.Validate(s.Text)).ToList();
        var ids = requested.Where(s => s.Id is not null).Select(s => s.Id!.Value).ToList();
        if (ids.Distinct().Count() != ids.Count) throw new DomainException("subtasks", "Subtask ids must be unique.");

        // Reuse existing subtasks by id; anything unknown is created with a server-generated id,
        // so a client can never collide with or hijack another task's rows.
        var existing = _subtasks.ToDictionary(s => s.Id);
        var next = new List<Subtask>(requested.Count);
        for (var i = 0; i < requested.Count; i++)
        {
            if (requested[i].Id is { } id && existing.TryGetValue(id, out var current))
            {
                current.Set(texts[i], requested[i].Done, i);
                next.Add(current);
            }
            else
            {
                next.Add(Subtask.Create(texts[i], requested[i].Done, i));
            }
        }

        Title = title;
        Description = description;
        Lane = d.Lane;
        Priority = d.Priority;
        Points = d.Points;
        Tag = d.Tag;
        Assignee = d.Assignee;
        DueDate = d.DueDate;
        _subtasks.Clear();
        _subtasks.AddRange(next);
        UpdatedAt = now;
    }

    internal void Unassign(DateTimeOffset now)
    {
        Assignee = Rules.Unassigned;
        UpdatedAt = now;
    }

    internal void MoveTo(Lane lane, DateTimeOffset now)
    {
        if (!Enum.IsDefined(lane)) throw new DomainException("status", "Unknown status.");
        Lane = lane;
        UpdatedAt = now;
    }
}

/// <summary>Value bag for creating or replacing a task; validated when applied to the entity.</summary>
public sealed record TaskDetails(
    string Title,
    string? Description,
    Lane Lane,
    Priority Priority,
    int Points,
    string Assignee,
    string Tag,
    DateOnly? DueDate,
    IReadOnlyList<SubtaskDetails>? Subtasks);

public sealed record SubtaskDetails(Guid? Id, string? Text, bool Done);
