using System.Security.Claims;
using Kanban.Application.Boards;
using Kanban.Application.Common;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Kanban.Api.Endpoints;

/// <summary>
/// Board and task routes. The owner id always comes from the authenticated principal, never from the
/// route or body, so a user can only ever touch their own board (OWASP A01). Unknown or foreign task
/// ids both return 404 so existence is not leaked.
/// </summary>
internal static class BoardEndpoints
{
    public static void MapBoardEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api").RequireAuthorization().WithTags("Board");

        api.MapGet("/board", (ClaimsPrincipal user, BoardService svc, CancellationToken ct) =>
            svc.GetOrCreateAsync(Owner(user), ct));

        api.MapPatch("/board", async (BoardUpdateRequest body, ClaimsPrincipal user, BoardService svc, CancellationToken ct) =>
            ToHttp(await svc.RenameAsync(Owner(user), body, ct)));

        api.MapPost("/board/members", async (MemberRequest body, ClaimsPrincipal user, BoardService svc, CancellationToken ct) =>
            ToHttp(await svc.AddMemberAsync(Owner(user), body, ct)));

        api.MapDelete("/board/members/{memberId:guid}", async (Guid memberId, ClaimsPrincipal user, BoardService svc, CancellationToken ct) =>
            ToHttp(await svc.RemoveMemberAsync(Owner(user), memberId, ct)));

        api.MapPost("/tasks", async (TaskRequest body, ClaimsPrincipal user, BoardService svc, CancellationToken ct) =>
            ToHttp(await svc.CreateTaskAsync(Owner(user), body, ct), created: true));

        api.MapPut("/tasks/{id:int}", async (int id, TaskRequest body, ClaimsPrincipal user, BoardService svc, CancellationToken ct) =>
            ToHttp(await svc.UpdateTaskAsync(Owner(user), id, body, ct)));

        api.MapPatch("/tasks/{id:int}/status", async (int id, MoveTaskRequest body, ClaimsPrincipal user, BoardService svc, CancellationToken ct) =>
            ToHttp(await svc.MoveTaskAsync(Owner(user), id, body, ct)));

        api.MapDelete("/tasks/{id:int}", async Task<Results<NoContent, NotFound>> (int id, ClaimsPrincipal user, BoardService svc, CancellationToken ct) =>
            await svc.DeleteTaskAsync(Owner(user), id, ct) ? TypedResults.NoContent() : TypedResults.NotFound());
    }

    private static string Owner(ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new InvalidOperationException("Authenticated principal has no name identifier.");

    private static IResult ToHttp<T>(Result<T> result, bool created = false)
        where T : class => result.Error switch
    {
        ErrorKind.None when created && result.Value is TaskDto t => TypedResults.Created($"/api/tasks/{t.Id}", t),
        ErrorKind.None => TypedResults.Ok(result.Value),
        ErrorKind.NotFound => TypedResults.NotFound(),
        _ => TypedResults.ValidationProblem(result.Errors!),
    };
}
