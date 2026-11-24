using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Kanban.Api.Endpoints;
using Kanban.Api.Security;
using Kanban.Application;
using Kanban.Infrastructure;
using Kanban.Infrastructure.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var isDev = builder.Environment.IsDevelopment();

// --- Transport limits (OWASP A05 / DoS) -------------------------------------------------------
builder.WebHost.ConfigureKestrel(k =>
{
    k.AddServerHeader = false;                     // do not advertise the server stack
    k.Limits.MaxRequestBodySize = 256 * 1024;      // largest legit payload is a task with 50 subtasks
    k.Limits.MaxRequestHeadersTotalSize = 32 * 1024;
});

// --- Layers -------------------------------------------------------------------------------------
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// --- JSON: reject unknown properties so clients cannot mass-assign fields (OWASP API6) -------------
builder.Services.Configure<JsonOptions>(o =>
{
    o.SerializerOptions.UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow;
    o.SerializerOptions.MaxDepth = 16;
});
// Malformed bodies are a client error (400), in every environment — never a 500.
builder.Services.Configure<Microsoft.AspNetCore.Routing.RouteHandlerOptions>(o => o.ThrowOnBadRequest = false);

// --- Data Protection keys (sign the auth cookie); persisted so sessions survive restarts ---------
var dataDir = Path.Combine(builder.Environment.ContentRootPath, "App_Data");
Directory.CreateDirectory(dataDir);
var dp = builder.Services.AddDataProtection()
    .SetApplicationName("kanban-studio")
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(dataDir, "keys")));
if (OperatingSystem.IsWindows()) dp.ProtectKeysWithDpapi(); // keys encrypted at rest (OWASP A02)

// --- Authentication: HttpOnly, SameSite=Strict cookie — no tokens in JS-readable storage ---------
builder.Services
    .AddAuthentication(IdentityConstants.ApplicationScheme)
    .AddIdentityCookies();

builder.Services.ConfigureApplicationCookie(o =>
{
    // "__Host-" prefix pins the cookie to this exact origin over HTTPS; browsers refuse it over plain HTTP.
    o.Cookie.Name = isDev ? "kanban.sid" : "__Host-kanban";
    o.Cookie.HttpOnly = true;
    o.Cookie.SameSite = SameSiteMode.Strict;
    o.Cookie.SecurePolicy = isDev ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    o.Cookie.Path = "/";
    o.ExpireTimeSpan = TimeSpan.FromHours(8);
    o.SlidingExpiration = true;

    // APIs answer with status codes, not login-page redirects.
    o.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; };
    o.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; };
});

// Revalidate the security stamp often so password changes / lockouts kill live sessions quickly.
builder.Services.Configure<SecurityStampValidatorOptions>(o => o.ValidationInterval = TimeSpan.FromMinutes(5));

// --- Authorization: deny by default (OWASP A01) ----------------------------------------------------
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build());

// --- Rate limiting (OWASP A04 / A07: brute force & credential stuffing) ----------------------------
var authPermitLimit = builder.Configuration.GetValue("RateLimiting:AuthPermitPerMinute", 10);
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    o.AddPolicy(AuthEndpoints.RateLimitPolicy, ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = authPermitLimit, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));

    o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx => RateLimitPartition.GetTokenBucketLimiter(
        ctx.User.Identity?.Name ?? ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 120,
            TokensPerPeriod = 60,
            ReplenishmentPeriod = TimeSpan.FromSeconds(10),
            QueueLimit = 0,
        }));
});

// --- Errors: RFC 9457 ProblemDetails, never stack traces (OWASP A05 / A09) --------------------------
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

if (!isDev)
{
    builder.Services.AddHsts(o =>
    {
        o.MaxAge = TimeSpan.FromDays(365);
        o.IncludeSubDomains = true;
        o.Preload = true;
    });
}

var app = builder.Build();

if (app.Configuration.GetValue("Database:MigrateOnStartup", true))
{
    await using var scope = app.Services.CreateAsyncScope();
    await scope.ServiceProvider.GetRequiredService<KanbanDbContext>().Database.MigrateAsync();
}

app.UseExceptionHandler();
app.UseStatusCodePages();
if (!isDev)
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<ServerTimingMiddleware>();
// Built SPA (web/ -> wwwroot); public, served before auth.
// Hashed bundles are immutable for a year; index.html must always revalidate so a deploy is picked up.
var spaFiles = new StaticFileOptions
{
    OnPrepareResponse = ctx => ctx.Context.Response.Headers.CacheControl =
        ctx.Context.Request.Path.StartsWithSegments("/assets")
            ? "public, max-age=31536000, immutable"
            : "no-cache",
};
app.UseDefaultFiles();
app.UseStaticFiles(spaFiles);

app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();
app.UseMiddleware<CsrfGuardMiddleware>();

app.MapHealthChecks("/healthz").AllowAnonymous().DisableRateLimiting();
app.MapAuthEndpoints();
app.MapBoardEndpoints();
app.MapFallback("/api/{**path}", () => Results.NotFound()).AllowAnonymous();
app.MapFallbackToFile("index.html", spaFiles).AllowAnonymous();

await app.RunAsync();

public partial class Program;
