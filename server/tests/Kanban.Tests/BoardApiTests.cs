using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace Kanban.Tests;

public sealed class BoardApiTests(KanbanFactory factory) : IClassFixture<KanbanFactory>
{
    [Fact]
    public async Task New_account_gets_a_seeded_board()
    {
        var client = await factory.CreateSignedInClientAsync();
        var board = await client.GetFromJsonAsync<JsonElement>("/api/board");

        Assert.Equal(6, board.GetProperty("tasks").GetArrayLength());
        Assert.Equal(5, board.GetProperty("lanes").GetArrayLength());
        Assert.Equal(1, board.GetProperty("members").GetArrayLength());
        Assert.Equal("in-progress", board.GetProperty("lanes")[2].GetProperty("key").GetString());
        Assert.Equal("Test User", board.GetProperty("members")[0].GetProperty("name").GetString());
        Assert.All(board.GetProperty("tasks").EnumerateArray(), t => Assert.Equal("Test User", t.GetProperty("assignee").GetString()));
    }

    [Fact]
    public async Task Task_lifecycle_create_move_update_delete()
    {
        var client = await factory.CreateSignedInClientAsync();

        var created = await client.PostAsJsonAsync("/api/tasks", new
        {
            title = "  Trim me  ",
            status = "backlog",
            priority = "critical",
            points = 8,
            assignee = "Test User",
            tag = "Ops",
            dueDate = "2026-12-01",
            subtasks = new[] { new { text = "first", done = false }, new { text = "second", done = true } },
        });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var task = await created.Content.ReadFromJsonAsync<JsonElement>();
        var id = task.GetProperty("id").GetInt32();
        Assert.Equal("Trim me", task.GetProperty("title").GetString());

        var moved = await client.PatchAsJsonAsync($"/api/tasks/{id}/status", new { status = "review" });
        Assert.Equal("review", (await moved.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("status").GetString());

        // Update keeps subtask identity for known ids, preserves order, and assigns server ids to new ones.
        var subs = task.GetProperty("subtasks");
        var firstId = subs[0].GetProperty("id").GetGuid();
        var updated = await client.PutAsJsonAsync($"/api/tasks/{id}", new
        {
            title = "Renamed",
            status = "review",
            priority = "low",
            points = 2,
            assignee = "Unassigned",
            tag = "Ops",
            subtasks = new object[]
            {
                new { text = "new one", done = false },
                new { id = firstId, text = "first (edited)", done = true },
            },
        });
        Assert.Equal(HttpStatusCode.OK, updated.StatusCode);
        var after = (await updated.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("subtasks");
        Assert.Equal(2, after.GetArrayLength());
        Assert.Equal("new one", after[0].GetProperty("text").GetString());
        Assert.Equal(firstId, after[1].GetProperty("id").GetGuid());
        Assert.True(after[1].GetProperty("done").GetBoolean());

        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync($"/api/tasks/{id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync($"/api/tasks/{id}")).StatusCode);
    }

    [Fact]
    public async Task Board_can_be_renamed_and_validates_name()
    {
        var client = await factory.CreateSignedInClientAsync();
        var ok = await client.PatchAsJsonAsync("/api/board", new { name = "  Q3 Launch  " });
        Assert.Equal("Q3 Launch", (await ok.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("name").GetString());

        var bad = await client.PatchAsJsonAsync("/api/board", new { name = "   " });
        Assert.Equal(HttpStatusCode.BadRequest, bad.StatusCode);
    }

    [Fact]
    public async Task Members_can_be_added_kept_in_order_and_removed_which_unassigns_their_tasks()
    {
        var client = await factory.CreateSignedInClientAsync();
        var added = await client.PostAsJsonAsync("/api/board/members", new { name = "Ada Lovelace", role = "Engineer" });
        var board = await added.Content.ReadFromJsonAsync<JsonElement>();
        var ada = board.GetProperty("members")[1];
        Assert.Equal("Ada Lovelace", ada.GetProperty("name").GetString());
        Assert.Equal("AL", ada.GetProperty("initials").GetString());

        var dup = await client.PostAsJsonAsync("/api/board/members", new { name = "ada lovelace", role = "" });
        Assert.Equal(HttpStatusCode.BadRequest, dup.StatusCode);

        var created = await client.PostAsJsonAsync("/api/tasks", new { title = "Hers", points = 3, tag = "Feature", assignee = "Ada Lovelace" });
        var taskId = (await created.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetInt32();

        var removed = await client.DeleteAsync($"/api/board/members/{ada.GetProperty("id").GetGuid()}");
        var after = await removed.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(1, after.GetProperty("members").GetArrayLength());
        var task = after.GetProperty("tasks").EnumerateArray().Single(t => t.GetProperty("id").GetInt32() == taskId);
        Assert.Equal("Unassigned", task.GetProperty("assignee").GetString());

        Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync($"/api/board/members/{Guid.NewGuid()}")).StatusCode);
    }

    [Fact]
    public async Task Responses_carry_server_timing()
    {
        var client = await factory.CreateSignedInClientAsync();
        var res = await client.GetAsync("/api/board");
        Assert.StartsWith("app;dur=", res.Headers.GetValues("Server-Timing").Single(), StringComparison.Ordinal);
    }
}
