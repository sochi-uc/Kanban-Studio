namespace Kanban.Api.Security;

/// <summary>
/// CSRF defence-in-depth for the cookie-authenticated API (OWASP A01).
/// Layer 1: the session cookie is SameSite=Strict.
/// Layer 2 (here): state-changing /api requests must carry the custom <c>X-Kanban-Client</c> header,
/// which a cross-site form or image cannot send and a cross-site fetch cannot send without a CORS
/// preflight (and no CORS policy is registered). If an Origin header is present it must match the host.
/// </summary>
internal sealed class CsrfGuardMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Kanban-Client";

    public Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;
        if (!request.Path.StartsWithSegments("/api") || HttpMethods.IsGet(request.Method) ||
            HttpMethods.IsHead(request.Method) || HttpMethods.IsOptions(request.Method))
        {
            return next(context);
        }

        if (!request.Headers.ContainsKey(HeaderName) || !OriginMatches(request))
        {
            return Results.Problem(
                    statusCode: StatusCodes.Status403Forbidden,
                    title: "Request blocked",
                    detail: "Cross-site request rejected.")
                .ExecuteAsync(context);
        }

        return next(context);
    }

    private static bool OriginMatches(HttpRequest request)
    {
        var origin = request.Headers.Origin.ToString();
        if (string.IsNullOrEmpty(origin)) return true; // same-origin GET-style navigations / non-browser clients
        return Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
               string.Equals(uri.Authority, request.Host.Value, StringComparison.OrdinalIgnoreCase);
    }
}
