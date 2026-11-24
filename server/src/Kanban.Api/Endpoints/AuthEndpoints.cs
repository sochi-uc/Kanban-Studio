using System.ComponentModel.DataAnnotations;
using Kanban.Application.Boards;
using Kanban.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace Kanban.Api.Endpoints;

internal static class AuthEndpoints
{
    public const string RateLimitPolicy = "auth";
    private const int PasswordMax = 128; // bounds hashing cost per request (DoS)
    private const string InvalidCredentials = "Invalid email or password.";

    public sealed record RegisterRequest(string? Email, string? Password, string? DisplayName);
    public sealed record LoginRequest(string? Email, string? Password);
    public sealed record MeResponse(string Email, string DisplayName);

    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", RegisterAsync).AllowAnonymous().RequireRateLimiting(RateLimitPolicy);
        group.MapPost("/login", LoginAsync).AllowAnonymous().RequireRateLimiting(RateLimitPolicy);
        group.MapPost("/logout", LogoutAsync);
        group.MapGet("/me", MeAsync);
    }

    private static async Task<Results<Ok<MeResponse>, ValidationProblem>> RegisterAsync(
        RegisterRequest body,
        UserManager<AppUser> users,
        SignInManager<AppUser> signIn,
        BoardService boards,
        ILogger<RegisterRequest> log,
        CancellationToken ct)
    {
        var email = body.Email?.Trim() ?? string.Empty;
        var name = body.DisplayName?.Trim() ?? string.Empty;
        var password = body.Password ?? string.Empty;

        var errors = new Dictionary<string, string[]>();
        if (email.Length is 0 or > 254 || !new EmailAddressAttribute().IsValid(email)) errors["email"] = ["Enter a valid email address."];
        if (name.Length is 0 or > 60) errors["displayName"] = ["Display name must be 1–60 characters."];
        if (password.Length > PasswordMax) errors["password"] = [$"Password must be at most {PasswordMax} characters."];
        if (errors.Count > 0) return TypedResults.ValidationProblem(errors);

        var user = new AppUser { UserName = email, Email = email, DisplayName = name };
        var result = await users.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            // Do not reveal whether an account already exists (user enumeration).
            var messages = result.Errors
                .Select(e => e.Code is "DuplicateUserName" or "DuplicateEmail"
                    ? "Unable to register with these details."
                    : e.Description)
                .Distinct()
                .ToArray();
            return TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["password"] = messages });
        }

        log.LogInformation("Account created for user {UserId}", user.Id);
        await boards.EnsureBoardAsync(user.Id, name, ct);
        await signIn.SignInAsync(user, isPersistent: false);
        return TypedResults.Ok(new MeResponse(email, name));
    }

    private static async Task<Results<Ok<MeResponse>, ProblemHttpResult>> LoginAsync(
        LoginRequest body,
        UserManager<AppUser> users,
        SignInManager<AppUser> signIn,
        IPasswordHasher<AppUser> hasher,
        HttpContext http,
        ILogger<LoginRequest> log)
    {
        var email = body.Email?.Trim() ?? string.Empty;
        var password = body.Password ?? string.Empty;
        if (email.Length is 0 or > 254 || password.Length is 0 or > PasswordMax) return Unauthorized();

        var user = await users.FindByEmailAsync(email);
        if (user is null)
        {
            // Equalise timing with the real hash check so response time does not reveal unknown emails.
            hasher.VerifyHashedPassword(DummyUser, DummyHash(hasher), password);
            log.LogWarning("Failed login (unknown account) from {RemoteIp}", http.Connection.RemoteIpAddress);
            return Unauthorized();
        }

        var result = await signIn.PasswordSignInAsync(user, password, isPersistent: false, lockoutOnFailure: true);
        if (result.Succeeded)
        {
            log.LogInformation("User {UserId} signed in", user.Id);
            return TypedResults.Ok(new MeResponse(user.Email!, user.DisplayName));
        }

        log.LogWarning("Failed login for user {UserId} (lockedOut={LockedOut}) from {RemoteIp}",
            user.Id, result.IsLockedOut, http.Connection.RemoteIpAddress);
        return Unauthorized();
    }

    private static async Task<NoContent> LogoutAsync(SignInManager<AppUser> signIn)
    {
        await signIn.SignOutAsync();
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<MeResponse>, UnauthorizedHttpResult>> MeAsync(
        HttpContext http, UserManager<AppUser> users)
    {
        var user = await users.GetUserAsync(http.User);
        return user is null
            ? TypedResults.Unauthorized()
            : TypedResults.Ok(new MeResponse(user.Email!, user.DisplayName));
    }

    private static ProblemHttpResult Unauthorized() =>
        TypedResults.Problem(statusCode: StatusCodes.Status401Unauthorized, title: "Sign-in failed", detail: InvalidCredentials);

    private static readonly AppUser DummyUser = new() { UserName = "dummy" };
    private static string? _dummyHash;

    private static string DummyHash(IPasswordHasher<AppUser> hasher) =>
        _dummyHash ??= hasher.HashPassword(DummyUser, Guid.NewGuid().ToString("N"));
}
