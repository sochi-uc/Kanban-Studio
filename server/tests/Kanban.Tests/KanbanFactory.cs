using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Kanban.Tests;

/// <summary>Boots the real API (full middleware pipeline) against a throwaway SQLite file.</summary>
public sealed class KanbanFactory : WebApplicationFactory<Program>
{
    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"kanban-test-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:Kanban", $"Data Source={_dbPath};Pooling=False");
        builder.UseSetting("RateLimiting:AuthPermitPerMinute", "1000");
    }

    /// <summary>A browser-like client: keeps cookies and sends the CSRF header the SPA sends.</summary>
    public HttpClient CreateBrowserClient()
    {
        var client = CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true, AllowAutoRedirect = false });
        client.DefaultRequestHeaders.Add("X-Kanban-Client", "web");
        return client;
    }

    public async Task<HttpClient> CreateSignedInClientAsync(string? email = null)
    {
        var client = CreateBrowserClient();
        var res = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = email ?? $"user-{Guid.NewGuid():N}@example.test",
            password = "correct horse battery staple",
            displayName = "Test User",
        });
        res.EnsureSuccessStatusCode();
        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        try { File.Delete(_dbPath); } catch (IOException) { }
    }
}
