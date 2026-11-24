namespace Kanban.Domain.Boards;

public sealed class BoardMember
{
    private BoardMember() { }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Role { get; private set; } = string.Empty;
    public string Initials { get; private set; } = string.Empty;

    /// <summary>Palette key (e.g. "indigo") rather than a raw colour, so the client owns presentation.</summary>
    public string Hue { get; private set; } = string.Empty;

    /// <summary>Display order; relational stores do not preserve collection order.</summary>
    public int Position { get; private set; }

    internal static BoardMember Create(string name, string role, string initials, string hue) => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        Role = role,
        Initials = initials,
        Hue = hue,
    };

    internal void SetPosition(int position) => Position = position;
}
