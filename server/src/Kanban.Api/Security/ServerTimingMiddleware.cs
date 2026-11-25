using System.Diagnostics;
using System.Globalization;

namespace Kanban.Api.Security;

/// <summary>Emits a W3C Server-Timing header so the web client can show real server latency.</summary>
internal sealed class ServerTimingMiddleware(RequestDelegate next)
{
    public Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments("/api")) return next(context);

        var start = Stopwatch.GetTimestamp();
        context.Response.OnStarting(() =>
        {
            var ms = Stopwatch.GetElapsedTime(start).TotalMilliseconds;
            context.Response.Headers["Server-Timing"] = string.Create(CultureInfo.InvariantCulture, $"app;dur={ms:0.0}");
            return Task.CompletedTask;
        });
        return next(context);
    }
}
