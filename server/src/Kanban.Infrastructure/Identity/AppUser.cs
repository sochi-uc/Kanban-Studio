using Microsoft.AspNetCore.Identity;

namespace Kanban.Infrastructure.Identity;

public sealed class AppUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
}
