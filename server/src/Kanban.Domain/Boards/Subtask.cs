namespace Kanban.Domain.Boards;

public sealed class Subtask
{
    private Subtask() { }

    public Guid Id { get; private set; }
    public string Text { get; private set; } = string.Empty;
    public bool Done { get; private set; }

    /// <summary>Display order; relational stores do not preserve collection order on their own.</summary>
    public int Position { get; private set; }

    internal static Subtask Create(string text, bool done, int position) =>
        new() { Id = Guid.NewGuid(), Text = text, Done = done, Position = position };

    internal void Set(string text, bool done, int position)
    {
        Text = text;
        Done = done;
        Position = position;
    }

    internal static string Validate(string? text)
    {
        var trimmed = (text ?? string.Empty).Trim();
        if (trimmed.Length == 0) throw new DomainException("subtasks", "Subtask text is required.");
        if (trimmed.Length > Rules.SubtaskTextMax)
            throw new DomainException("subtasks", $"Subtask text must be at most {Rules.SubtaskTextMax} characters.");
        return trimmed;
    }
}
