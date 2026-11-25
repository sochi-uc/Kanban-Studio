using Kanban.Application.Common;
using Kanban.Domain;
using Kanban.Domain.Boards;

namespace Kanban.Application.Boards;

/// <summary>Board use cases. Callers pass the authenticated owner id; it is never taken from the request body.</summary>
public sealed class BoardService(IBoardRepository repository, TimeProvider clock)
{
    public async Task<BoardDto> GetOrCreateAsync(string ownerId, CancellationToken ct) =>
        WireFormat.ToDto(await LoadOrCreateAsync(ownerId, ownerName: null, ct));

    /// <summary>Called at sign-up so the first board carries the user's own name as its first member.</summary>
    public Task EnsureBoardAsync(string ownerId, string ownerName, CancellationToken ct) =>
        LoadOrCreateAsync(ownerId, ownerName, ct);

    public async Task<Result<BoardDto>> RenameAsync(string ownerId, BoardUpdateRequest request, CancellationToken ct)
    {
        var board = await LoadOrCreateAsync(ownerId, ownerName: null, ct);
        try
        {
            board.Rename(request.Name);
        }
        catch (DomainException ex)
        {
            return Result<BoardDto>.Invalid(ex.Field, ex.Message);
        }

        await repository.SaveChangesAsync(ct);
        return Result<BoardDto>.Ok(WireFormat.ToDto(board));
    }

    public async Task<Result<BoardDto>> AddMemberAsync(string ownerId, MemberRequest request, CancellationToken ct)
    {
        var board = await LoadOrCreateAsync(ownerId, ownerName: null, ct);
        try
        {
            board.AddMember(request.Name, request.Role);
        }
        catch (DomainException ex)
        {
            return Result<BoardDto>.Invalid(ex.Field, ex.Message);
        }

        await repository.SaveChangesAsync(ct);
        return Result<BoardDto>.Ok(WireFormat.ToDto(board));
    }

    public async Task<Result<BoardDto>> RemoveMemberAsync(string ownerId, Guid memberId, CancellationToken ct)
    {
        var board = await repository.GetForOwnerAsync(ownerId, ct);
        if (board is null || !board.RemoveMember(memberId, clock.GetUtcNow())) return Result<BoardDto>.NotFound();
        await repository.SaveChangesAsync(ct);
        return Result<BoardDto>.Ok(WireFormat.ToDto(board));
    }

    public async Task<Result<TaskDto>> CreateTaskAsync(string ownerId, TaskRequest request, CancellationToken ct)
    {
        var board = await LoadOrCreateAsync(ownerId, ownerName: null, ct);
        if (!TryBuild(request, out var details, out var error)) return error;

        try
        {
            var task = board.AddTask(details, clock.GetUtcNow());
            await repository.SaveChangesAsync(ct);
            return Result<TaskDto>.Ok(WireFormat.ToDto(task));
        }
        catch (DomainException ex)
        {
            return Result<TaskDto>.Invalid(ex.Field, ex.Message);
        }
    }

    public async Task<Result<TaskDto>> UpdateTaskAsync(string ownerId, int taskId, TaskRequest request, CancellationToken ct)
    {
        var board = await repository.GetForOwnerAsync(ownerId, ct);
        var task = board?.Tasks.FirstOrDefault(t => t.Id == taskId);
        if (board is null || task is null) return Result<TaskDto>.NotFound();
        if (!TryBuild(request, out var details, out var error)) return error;

        try
        {
            board.UpdateTask(task, details, clock.GetUtcNow());
            await repository.SaveChangesAsync(ct);
            return Result<TaskDto>.Ok(WireFormat.ToDto(task));
        }
        catch (DomainException ex)
        {
            return Result<TaskDto>.Invalid(ex.Field, ex.Message);
        }
    }

    public async Task<Result<TaskDto>> MoveTaskAsync(string ownerId, int taskId, MoveTaskRequest request, CancellationToken ct)
    {
        var board = await repository.GetForOwnerAsync(ownerId, ct);
        var task = board?.Tasks.FirstOrDefault(t => t.Id == taskId);
        if (board is null || task is null) return Result<TaskDto>.NotFound();
        if (!WireFormat.TryParseLane(request.Status, out var lane)) return Result<TaskDto>.Invalid("status", "Unknown status.");

        board.MoveTask(task, lane, clock.GetUtcNow());
        await repository.SaveChangesAsync(ct);
        return Result<TaskDto>.Ok(WireFormat.ToDto(task));
    }

    public async Task<bool> DeleteTaskAsync(string ownerId, int taskId, CancellationToken ct)
    {
        var board = await repository.GetForOwnerAsync(ownerId, ct);
        var task = board?.Tasks.FirstOrDefault(t => t.Id == taskId);
        if (board is null || task is null) return false;

        board.RemoveTask(task);
        await repository.SaveChangesAsync(ct);
        return true;
    }

    private async Task<Board> LoadOrCreateAsync(string ownerId, string? ownerName, CancellationToken ct)
    {
        var board = await repository.GetForOwnerAsync(ownerId, ct);
        if (board is not null) return board;

        board = BoardSeed.CreateBoard(ownerId, ownerName ?? "Me", clock.GetUtcNow());
        repository.Add(board);
        await repository.SaveChangesAsync(ct);
        return board;
    }

    private static bool TryBuild(TaskRequest r, out TaskDetails details, out Result<TaskDto> error)
    {
        details = null!;
        error = null!;

        if (!WireFormat.TryParseLane(r.Status ?? "todo", out var lane))
        {
            error = Result<TaskDto>.Invalid("status", "Unknown status.");
            return false;
        }

        if (!WireFormat.TryParsePriority(r.Priority ?? "medium", out var priority))
        {
            error = Result<TaskDto>.Invalid("priority", "Unknown priority.");
            return false;
        }

        if (!WireFormat.TryParseDate(r.DueDate, out var due))
        {
            error = Result<TaskDto>.Invalid("dueDate", "Due date must be yyyy-MM-dd between 2000 and 2100.");
            return false;
        }

        details = new TaskDetails(
            r.Title ?? string.Empty,
            r.Description,
            lane,
            priority,
            r.Points ?? 3,
            string.IsNullOrWhiteSpace(r.Assignee) ? Rules.Unassigned : r.Assignee.Trim(),
            r.Tag ?? Rules.Tags[0],
            due,
            r.Subtasks?.Select(s => new SubtaskDetails(s.Id, s.Text ?? string.Empty, s.Done)).ToList());
        return true;
    }
}
