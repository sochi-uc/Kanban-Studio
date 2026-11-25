using Kanban.Domain.Boards;

namespace Kanban.Application.Boards;

/// <summary>
/// First-run workspace: the owner as the only member and a handful of tasks that teach the UI
/// by doing (open a card, drag it, tick it). Users delete them when they're done.
/// </summary>
public static class BoardSeed
{
    public static Board CreateBoard(string ownerId, string ownerName, DateTimeOffset now)
    {
        var board = Board.Create(ownerId, "My board", now);
        board.AddMember(string.IsNullOrWhiteSpace(ownerName) ? "Me" : ownerName, "Owner");
        AddOnboardingTasks(board, board.Members[0].Name, now);
        return board;
    }

    private static void AddOnboardingTasks(Board board, string owner, DateTimeOffset now)
    {
        var today = DateOnly.FromDateTime(now.UtcDateTime);
        TaskDetails T(string title, string description, Lane lane, Priority priority, int points, string tag, int? dueInDays,
            params SubtaskDetails[] subtasks) =>
            new(title, description, lane, priority, points, owner, tag, dueInDays is { } d ? today.AddDays(d) : null, subtasks);
        static SubtaskDetails S(string text, bool done = false) => new(null, text, done);

        TaskDetails[] tasks =
        [
            T("Open me to see task details",
              "Everything about a task lives in this panel: status, priority, owner, points, due date, a checklist and notes. Changes save automatically.",
              Lane.Todo, Priority.High, 1, "Docs", 2,
              S("Change the priority"), S("Add a subtask of your own"), S("Tick this one off", done: false)),
            T("Drag this card to In Progress",
              "Drag cards between columns, or focus one and press Alt + → / Alt + ←.",
              Lane.Todo, Priority.Medium, 1, "Docs", null),
            T("Add your teammates",
              "Open Members in the sidebar to add the people you work with, then assign them tasks.",
              Lane.Backlog, Priority.Medium, 2, "Chore", 7),
            T("Press N to create a task from anywhere",
              "Or use the + at the bottom of any column to add one in place. Press ? to see every shortcut.",
              Lane.Backlog, Priority.Low, 1, "Docs", null),
            T("Tick the circle to complete a task",
              "Completed tasks move to Done. Untick to send them back.",
              Lane.InProgress, Priority.Medium, 1, "Docs", 1),
            T("Create your account", "You're in. Delete these starter cards whenever you're ready.",
              Lane.Done, Priority.Low, 1, "Chore", null, S("Sign up", done: true)),
        ];

        foreach (var t in tasks) board.AddTask(t, now);
    }
}
