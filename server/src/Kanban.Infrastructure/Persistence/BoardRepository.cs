using Kanban.Application.Boards;
using Kanban.Domain.Boards;
using Microsoft.EntityFrameworkCore;

namespace Kanban.Infrastructure.Persistence;

internal sealed class BoardRepository(KanbanDbContext db) : IBoardRepository
{
    public Task<Board?> GetForOwnerAsync(string ownerId, CancellationToken ct) =>
        db.Boards
            .Include(b => b.Tasks)
            .AsSplitQuery()
            .SingleOrDefaultAsync(b => b.OwnerId == ownerId, ct);

    public void Add(Board board) => db.Boards.Add(board);

    public Task SaveChangesAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
