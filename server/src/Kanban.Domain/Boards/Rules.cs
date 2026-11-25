namespace Kanban.Domain.Boards;

/// <summary>Single source of truth for every limit the API enforces (OWASP A04: bounded input by design).</summary>
public static class Rules
{
    public const int TitleMax = 200;
    public const int DescriptionMax = 4_000;
    public const int SubtaskTextMax = 300;
    public const int SubtasksMax = 50;
    public const int TasksPerBoardMax = 500;
    public const int BoardNameMax = 100;
    public const int MemberNameMax = 40;
    public const int MemberRoleMax = 60;
    public const int MembersMax = 25;
    public const string Unassigned = "Unassigned";

    public static readonly IReadOnlySet<int> StoryPoints = new HashSet<int> { 1, 2, 3, 5, 8, 13 };

    public static readonly IReadOnlyList<string> Tags =
    [
        "Feature", "Bug", "Design", "Research", "Docs", "Ops", "Security", "Chore",
    ];

    public static readonly IReadOnlyDictionary<Lane, int?> WipLimits = new Dictionary<Lane, int?>
    {
        [Lane.Backlog] = null,
        [Lane.Todo] = 6,
        [Lane.InProgress] = 4,
        [Lane.Review] = 3,
        [Lane.Done] = null,
    };
}
