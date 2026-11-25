using System.Globalization;
using Kanban.Domain.Boards;

namespace Kanban.Application.Boards;

/// <summary>Explicit allow-list mapping between wire keys and domain enums (no Enum.Parse on user input).</summary>
public static class WireFormat
{
    private static readonly Dictionary<string, Lane> LaneByKey = new(StringComparer.Ordinal)
    {
        ["backlog"] = Lane.Backlog,
        ["todo"] = Lane.Todo,
        ["in-progress"] = Lane.InProgress,
        ["review"] = Lane.Review,
        ["done"] = Lane.Done,
    };

    private static readonly Dictionary<string, Priority> PriorityByKey = new(StringComparer.Ordinal)
    {
        ["critical"] = Priority.Critical,
        ["high"] = Priority.High,
        ["medium"] = Priority.Medium,
        ["low"] = Priority.Low,
    };

    private static readonly Dictionary<Lane, string> KeyByLane = LaneByKey.ToDictionary(p => p.Value, p => p.Key);
    private static readonly Dictionary<Priority, string> KeyByPriority = PriorityByKey.ToDictionary(p => p.Value, p => p.Key);

    public static IEnumerable<Lane> Lanes => LaneByKey.Values;

    public static bool TryParseLane(string? key, out Lane lane) => LaneByKey.TryGetValue(key ?? string.Empty, out lane);
    public static bool TryParsePriority(string? key, out Priority p) => PriorityByKey.TryGetValue(key ?? string.Empty, out p);
    public static string ToKey(Lane lane) => KeyByLane[lane];
    public static string ToKey(Priority priority) => KeyByPriority[priority];

    public static bool TryParseDate(string? value, out DateOnly? date)
    {
        date = null;
        if (string.IsNullOrEmpty(value)) return true;
        if (!DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d)) return false;
        if (d.Year is < 2000 or > 2100) return false;
        date = d;
        return true;
    }

    public static string? ToKey(DateOnly? date) => date?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    public static TaskDto ToDto(SprintTask t) => new(
        t.Id,
        t.Title,
        t.Description,
        ToKey(t.Lane),
        ToKey(t.Priority),
        t.Points,
        t.Assignee,
        t.Tag,
        ToKey(t.DueDate),
        t.Subtasks.OrderBy(s => s.Position).Select(s => new SubtaskDto(s.Id, s.Text, s.Done)).ToList(),
        t.CreatedAt,
        t.UpdatedAt);

    public static BoardDto ToDto(Board b) => new(
        b.Id,
        b.Name,
        Lanes.Select(l => new LaneDto(ToKey(l), Rules.WipLimits[l])).ToList(),
        b.Members.OrderBy(m => m.Position).Select(m => new MemberDto(m.Id, m.Name, m.Role, m.Initials, m.Hue)).ToList(),
        Rules.Tags,
        Rules.StoryPoints.Order().ToList(),
        b.Tasks.OrderBy(t => t.Id).Select(ToDto).ToList());
}
