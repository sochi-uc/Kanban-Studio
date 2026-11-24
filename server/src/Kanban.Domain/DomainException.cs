namespace Kanban.Domain;

/// <summary>Raised when an operation would violate a domain invariant.</summary>
public sealed class DomainException(string field, string message) : Exception(message)
{
    public string Field { get; } = field;
}
