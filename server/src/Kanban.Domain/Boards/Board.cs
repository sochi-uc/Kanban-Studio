namespace Kanban.Domain.Boards;

/// <summary>
/// Aggregate root. Every task belongs to exactly one board and every board to exactly one owner,
/// which is what lets the API scope all reads and writes by owner (OWASP A01).
/// </summary>
public sealed class Board
{
    private static readonly string[] Hues = ["indigo", "green", "amber", "violet", "teal", "rose"];

    private readonly List<BoardMember> _members = [];
    private readonly List<SprintTask> _tasks = [];

    private Board() { }

    public Guid Id { get; private set; }
    public string OwnerId { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
    public IReadOnlyList<BoardMember> Members => _members;
    public IReadOnlyList<SprintTask> Tasks => _tasks;

    public static Board Create(string ownerId, string name, DateTimeOffset now)
    {
        if (string.IsNullOrWhiteSpace(ownerId)) throw new ArgumentException("Owner is required.", nameof(ownerId));
        var board = new Board { Id = Guid.NewGuid(), OwnerId = ownerId, CreatedAt = now };
        board.Rename(name);
        return board;
    }

    public void Rename(string? name)
    {
        var trimmed = (name ?? string.Empty).Trim();
        if (trimmed.Length is 0 or > Rules.BoardNameMax)
            throw new DomainException("name", $"Board name must be 1–{Rules.BoardNameMax} characters.");
        Name = trimmed;
    }

    public BoardMember AddMember(string? name, string? role)
    {
        var n = (name ?? string.Empty).Trim();
        var r = (role ?? string.Empty).Trim();
        if (n.Length is 0 or > Rules.MemberNameMax)
            throw new DomainException("name", $"Name must be 1–{Rules.MemberNameMax} characters.");
        if (r.Length > Rules.MemberRoleMax)
            throw new DomainException("role", $"Role must be at most {Rules.MemberRoleMax} characters.");
        if (string.Equals(n, Rules.Unassigned, StringComparison.OrdinalIgnoreCase) ||
            _members.Any(m => string.Equals(m.Name, n, StringComparison.OrdinalIgnoreCase)))
            throw new DomainException("name", "A member with that name already exists.");
        if (_members.Count >= Rules.MembersMax)
            throw new DomainException("name", $"A board can have at most {Rules.MembersMax} members.");

        var position = _members.Count == 0 ? 0 : _members.Max(m => m.Position) + 1;
        var member = BoardMember.Create(n, r, Initials(n), Hues[position % Hues.Length]);
        member.SetPosition(position);
        _members.Add(member);
        return member;
    }

    /// <summary>Removes a member; their tasks become unassigned rather than disappearing.</summary>
    public bool RemoveMember(Guid memberId, DateTimeOffset now)
    {
        var member = _members.FirstOrDefault(m => m.Id == memberId);
        if (member is null) return false;
        foreach (var task in _tasks.Where(t => t.Assignee == member.Name)) task.Unassign(now);
        _members.Remove(member);
        return true;
    }

    public bool IsAssignable(string assignee) =>
        assignee == Rules.Unassigned || _members.Any(m => m.Name == assignee);

    public SprintTask AddTask(TaskDetails details, DateTimeOffset now)
    {
        if (_tasks.Count >= Rules.TasksPerBoardMax)
            throw new DomainException("board", $"A board can hold at most {Rules.TasksPerBoardMax} tasks.");
        EnsureAssignable(details.Assignee);
        var task = SprintTask.Create(Id, details, now);
        _tasks.Add(task);
        return task;
    }

    public void UpdateTask(SprintTask task, TaskDetails details, DateTimeOffset now)
    {
        EnsureOwns(task);
        EnsureAssignable(details.Assignee);
        task.Apply(details, now);
    }

    public void MoveTask(SprintTask task, Lane lane, DateTimeOffset now)
    {
        EnsureOwns(task);
        task.MoveTo(lane, now);
    }

    public void RemoveTask(SprintTask task)
    {
        EnsureOwns(task);
        _tasks.Remove(task);
    }

    private static string Initials(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var letters = parts.Length >= 2 ? $"{parts[0][0]}{parts[^1][0]}" : name[..Math.Min(2, name.Length)];
        return letters.ToUpperInvariant();
    }

    private void EnsureAssignable(string assignee)
    {
        if (!IsAssignable(assignee)) throw new DomainException("assignee", "Assignee is not a member of this board.");
    }

    private void EnsureOwns(SprintTask task)
    {
        if (task.BoardId != Id) throw new InvalidOperationException("Task does not belong to this board.");
    }
}
