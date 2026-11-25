using Kanban.Application.Boards;
using Kanban.Domain;
using Kanban.Domain.Boards;

namespace Kanban.Tests;

public sealed class DomainTests
{
    private static readonly DateTimeOffset Now = new(2026, 9, 1, 0, 0, 0, TimeSpan.Zero);

    private static Board NewBoard() => BoardSeed.CreateBoard("owner-1", "Sochi", Now);

    private static TaskDetails Details(int points = 3, string tag = "Security", string assignee = "Sochi", string title = "Title") =>
        new(title, null, Lane.Todo, Priority.Medium, points, assignee, tag, null, null);

    [Theory]
    [InlineData(0)]
    [InlineData(4)]
    [InlineData(21)]
    public void Non_fibonacci_points_are_rejected(int points) =>
        Assert.Equal("points", Assert.Throws<DomainException>(() => NewBoard().AddTask(Details(points), Now)).Field);

    [Fact]
    public void Unknown_tag_is_rejected() =>
        Assert.Equal("tag", Assert.Throws<DomainException>(() => NewBoard().AddTask(Details(tag: "Hacking"), Now)).Field);

    [Fact]
    public void Non_member_assignee_is_rejected() =>
        Assert.Equal("assignee", Assert.Throws<DomainException>(() => NewBoard().AddTask(Details(assignee: "Eve"), Now)).Field);

    [Fact]
    public void Blank_title_is_rejected() =>
        Assert.Equal("title", Assert.Throws<DomainException>(() => NewBoard().AddTask(Details(title: "   "), Now)).Field);

    [Fact]
    public void Too_many_subtasks_are_rejected()
    {
        var many = Enumerable.Range(0, Rules.SubtasksMax + 1).Select(i => new SubtaskDetails(null, $"s{i}", false)).ToList();
        var details = Details() with { Subtasks = many };
        Assert.Equal("subtasks", Assert.Throws<DomainException>(() => NewBoard().AddTask(details, Now)).Field);
    }

    [Fact]
    public void Failed_update_leaves_task_unchanged()
    {
        var board = NewBoard();
        var task = board.AddTask(Details(title: "Original"), Now);

        Assert.Throws<DomainException>(() => board.UpdateTask(task, Details(points: 4, title: "Changed"), Now.AddHours(1)));
        Assert.Equal("Original", task.Title);
        Assert.Equal(Now, task.UpdatedAt);
    }

    [Fact]
    public void Wire_format_round_trips_every_lane() =>
        Assert.All(WireFormat.Lanes, lane =>
        {
            Assert.True(WireFormat.TryParseLane(WireFormat.ToKey(lane), out var parsed));
            Assert.Equal(lane, parsed);
        });
}
