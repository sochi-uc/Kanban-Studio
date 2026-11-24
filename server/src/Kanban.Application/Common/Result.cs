namespace Kanban.Application.Common;

public enum ErrorKind
{
    None,
    NotFound,
    Validation,
}

/// <summary>Use-case outcome. Keeps HTTP concerns out of the application layer.</summary>
public sealed record Result<T>(T? Value, ErrorKind Error, IReadOnlyDictionary<string, string[]>? Errors = null)
{
    public bool IsSuccess => Error == ErrorKind.None;

    public static Result<T> Ok(T value) => new(value, ErrorKind.None);
    public static Result<T> NotFound() => new(default, ErrorKind.NotFound);

    public static Result<T> Invalid(string field, string message) =>
        new(default, ErrorKind.Validation, new Dictionary<string, string[]> { [field] = [message] });
}
