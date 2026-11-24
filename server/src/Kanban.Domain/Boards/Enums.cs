namespace Kanban.Domain.Boards;

/// <summary>Workflow lane a task sits in. Named Lane to avoid clashing with System.Threading.Tasks.TaskStatus.</summary>
public enum Lane
{
    Backlog = 0,
    Todo = 1,
    InProgress = 2,
    Review = 3,
    Done = 4,
}

public enum Priority
{
    Critical = 0,
    High = 1,
    Medium = 2,
    Low = 3,
}
