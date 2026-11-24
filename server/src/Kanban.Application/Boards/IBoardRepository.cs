using Kanban.Domain.Boards;

namespace Kanban.Application.Boards;

/// <summary>
/// Persistence port for the Board aggregate. Every lookup is keyed by owner, so a caller can never
/// reach another user's board or tasks by guessing ids (OWASP A01 / IDOR).
/// </summary>
public interface IBoardRepository
{
    Task<Board?> GetForOwnerAsync(string ownerId, CancellationToken ct);
    void Add(Board board);
    Task SaveChangesAsync(CancellationToken ct);
}
