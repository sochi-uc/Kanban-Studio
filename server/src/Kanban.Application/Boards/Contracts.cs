namespace Kanban.Application.Boards;

// Wire contracts. Enums travel as stable string keys ("in-progress", "critical"), never as integers,
// so the client and server can evolve independently.

public sealed record SubtaskDto(Guid Id, string Text, bool Done);

public sealed record TaskDto(
    int Id,
    string Title,
    string Description,
    string Status,
    string Priority,
    int Points,
    string Assignee,
    string Tag,
    string? DueDate,
    IReadOnlyList<SubtaskDto> Subtasks,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record MemberDto(Guid Id, string Name, string Role, string Initials, string Hue);

public sealed record LaneDto(string Key, int? WipLimit);

public sealed record BoardDto(
    Guid Id,
    string Name,
    IReadOnlyList<LaneDto> Lanes,
    IReadOnlyList<MemberDto> Members,
    IReadOnlyList<string> Tags,
    IReadOnlyList<int> StoryPoints,
    IReadOnlyList<TaskDto> Tasks);

public sealed record SubtaskRequest(Guid? Id, string? Text, bool Done);

public sealed record TaskRequest(
    string? Title,
    string? Description,
    string? Status,
    string? Priority,
    int? Points,
    string? Assignee,
    string? Tag,
    string? DueDate,
    IReadOnlyList<SubtaskRequest>? Subtasks);

public sealed record MoveTaskRequest(string? Status);

public sealed record BoardUpdateRequest(string? Name);

public sealed record MemberRequest(string? Name, string? Role);
