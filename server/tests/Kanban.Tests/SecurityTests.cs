using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace Kanban.Tests;

/// <summary>Regression tests for the OWASP controls. Each test names the risk it guards.</summary>
public sealed class SecurityTests(KanbanFactory factory) : IClassFixture<KanbanFactory>
{
    private static readonly object ValidTask = new
    {
        title = "Ship it",
        status = "todo",
        priority = "high",
        points = 5,
        assignee = "Test User",
        tag = "Security",
    };

    [Fact]
    public async Task A01_Anonymous_requests_are_rejected()
    {
        var res = await factory.CreateBrowserClient().GetAsync("/api/board");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task A01_User_cannot_read_modify_or_delete_another_users_task()
    {
        var alice = await factory.CreateSignedInClientAsync();
        var mallory = await factory.CreateSignedInClientAsync();

        var created = await alice.PostAsJsonAsync("/api/tasks", ValidTask);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var id = (await created.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetInt32();

        Assert.Equal(HttpStatusCode.NotFound, (await mallory.PutAsJsonAsync($"/api/tasks/{id}", ValidTask)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await mallory.PatchAsJsonAsync($"/api/tasks/{id}/status", new { status = "done" })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await mallory.DeleteAsync($"/api/tasks/{id}")).StatusCode);

        var board = await mallory.GetFromJsonAsync<JsonElement>("/api/board");
        Assert.DoesNotContain(board.GetProperty("tasks").EnumerateArray(), t => t.GetProperty("id").GetInt32() == id);
    }

    [Fact]
    public async Task CSRF_State_change_without_client_header_is_blocked()
    {
        var client = await factory.CreateSignedInClientAsync();
        client.DefaultRequestHeaders.Remove("X-Kanban-Client");

        var res = await client.PostAsJsonAsync("/api/tasks", ValidTask);
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task CSRF_Cross_origin_request_is_blocked()
    {
        var client = await factory.CreateSignedInClientAsync();
        using var req = new HttpRequestMessage(HttpMethod.Post, "/api/tasks") { Content = JsonContent.Create(ValidTask) };
        req.Headers.Add("Origin", "https://evil.example");

        var res = await client.SendAsync(req);
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task API6_Unknown_json_properties_are_rejected()
    {
        var client = await factory.CreateSignedInClientAsync();
        var body = new StringContent(
            """{"title":"x","points":3,"tag":"Security","ownerId":"someone-else"}""", Encoding.UTF8, "application/json");

        var res = await client.PostAsync("/api/tasks", body);
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Theory]
    [InlineData("points", 4)]
    [InlineData("tag", "<script>")]
    [InlineData("assignee", "Not A Member")]
    [InlineData("status", "archived")]
    [InlineData("dueDate", "2026-13-40")]
    public async Task A03_Invalid_input_returns_validation_problem(string field, object value)
    {
        var client = await factory.CreateSignedInClientAsync();
        var payload = new Dictionary<string, object>
        {
            ["title"] = "Valid title",
            ["points"] = 3,
            ["tag"] = "Security",
            ["assignee"] = "Test User",
            [field] = value,
        };

        var res = await client.PostAsJsonAsync("/api/tasks", payload);
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var problem = await res.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(problem.GetProperty("errors").TryGetProperty(field, out _));
    }

    [Fact]
    public async Task A03_Oversized_title_is_rejected()
    {
        var client = await factory.CreateSignedInClientAsync();
        var res = await client.PostAsJsonAsync("/api/tasks", new { title = new string('a', 201), points = 3, tag = "Security" });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task A05_Security_headers_are_present_and_server_is_not_advertised()
    {
        var res = await factory.CreateBrowserClient().GetAsync("/healthz");

        Assert.Contains("default-src 'self'", res.Headers.GetValues("Content-Security-Policy").Single());
        Assert.Contains("frame-ancestors 'none'", res.Headers.GetValues("Content-Security-Policy").Single());
        Assert.Equal("nosniff", res.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", res.Headers.GetValues("X-Frame-Options").Single());
        Assert.Equal("no-referrer", res.Headers.GetValues("Referrer-Policy").Single());
        Assert.False(res.Headers.Contains("Server"));
    }

    [Fact]
    public async Task A05_Api_responses_are_not_cacheable()
    {
        var client = await factory.CreateSignedInClientAsync();
        var res = await client.GetAsync("/api/board");
        Assert.True(res.Headers.CacheControl?.NoStore);
    }

    [Fact]
    public async Task A07_Session_cookie_is_httponly_and_samesite_strict()
    {
        var client = factory.CreateBrowserClient();
        var res = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = $"c-{Guid.NewGuid():N}@example.test",
            password = "correct horse battery staple",
            displayName = "Cookie",
        });

        var cookie = res.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("kanban.sid=", StringComparison.Ordinal));
        Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=strict", cookie, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task A07_Short_passwords_are_rejected()
    {
        var res = await factory.CreateBrowserClient().PostAsJsonAsync("/api/auth/register", new
        {
            email = $"p-{Guid.NewGuid():N}@example.test",
            password = "short",
            displayName = "P",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task A07_Duplicate_registration_does_not_reveal_account_exists()
    {
        var email = $"dup-{Guid.NewGuid():N}@example.test";
        await factory.CreateSignedInClientAsync(email);

        var res = await factory.CreateBrowserClient().PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = "correct horse battery staple",
            displayName = "Dup",
        });
        var text = await res.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        Assert.DoesNotContain("already", text, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task A07_Account_locks_after_repeated_failures_with_generic_errors()
    {
        var email = $"lock-{Guid.NewGuid():N}@example.test";
        await factory.CreateSignedInClientAsync(email);
        var client = factory.CreateBrowserClient();

        var unknown = await client.PostAsJsonAsync("/api/auth/login", new { email = "nobody@example.test", password = "whatever-password" });
        var unknownBody = await unknown.Content.ReadAsStringAsync();

        string? wrongBody = null;
        for (var i = 0; i < 5; i++)
        {
            var wrong = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "definitely wrong pw" });
            Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
            wrongBody = await wrong.Content.ReadAsStringAsync();
        }

        // Unknown account and wrong password are indistinguishable.
        Assert.Equal(HttpStatusCode.Unauthorized, unknown.StatusCode);
        Assert.Equal(Detail(unknownBody), Detail(wrongBody!));

        // Now locked: even the right password fails.
        var locked = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "correct horse battery staple" });
        Assert.Equal(HttpStatusCode.Unauthorized, locked.StatusCode);
    }

    [Fact]
    public async Task Logout_ends_the_session()
    {
        var client = await factory.CreateSignedInClientAsync();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/auth/me")).StatusCode);

        await client.PostAsync("/api/auth/logout", null);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
    }

    [Fact]
    public async Task Unknown_api_routes_return_404_not_the_spa()
    {
        var res = await factory.CreateBrowserClient().GetAsync("/api/does-not-exist");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    private static string Detail(string json) => JsonDocument.Parse(json).RootElement.GetProperty("detail").GetString()!;
}
