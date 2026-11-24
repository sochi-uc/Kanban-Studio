namespace Kanban.Api.Security;

/// <summary>
/// OWASP A05 (Security Misconfiguration): hardened response headers on every response.
/// The CSP allows only same-origin resources — no inline scripts, no third-party fonts or CDNs.
/// </summary>
internal sealed class SecurityHeadersMiddleware(RequestDelegate next, IHostEnvironment env)
{
    private readonly string _csp = string.Join("; ",
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        env.IsDevelopment() ? string.Empty : "upgrade-insecure-requests").TrimEnd(';', ' ');

    public Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            var h = context.Response.Headers;
            h.ContentSecurityPolicy = _csp;
            h.XContentTypeOptions = "nosniff";
            h.XFrameOptions = "DENY";
            h["Referrer-Policy"] = "no-referrer";
            h["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()";
            h["Cross-Origin-Opener-Policy"] = "same-origin";
            h["Cross-Origin-Resource-Policy"] = "same-origin";

            if (context.Request.Path.StartsWithSegments("/api"))
            {
                // Authenticated data must never land in shared or browser caches.
                h.CacheControl = "no-store";
            }

            return Task.CompletedTask;
        });

        return next(context);
    }
}
