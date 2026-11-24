using Kanban.Application.Boards;
using Kanban.Infrastructure.Identity;
using Kanban.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Kanban.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connection = configuration.GetConnectionString("Kanban")
            ?? throw new InvalidOperationException("Connection string 'Kanban' is not configured.");

        services.AddDbContext<KanbanDbContext>(o => o.UseSqlite(connection));
        services.AddScoped<IBoardRepository, BoardRepository>();

        // OWASP A07: ASP.NET Core Identity — PBKDF2-HMAC-SHA512 hashing (100k iterations), lockout,
        // and length-first password policy in line with NIST SP 800-63B.
        services
            .AddIdentityCore<AppUser>(o =>
            {
                o.User.RequireUniqueEmail = true;
                o.Password.RequiredLength = 12;
                o.Password.RequireDigit = false;
                o.Password.RequireLowercase = false;
                o.Password.RequireUppercase = false;
                o.Password.RequireNonAlphanumeric = false;
                o.Password.RequiredUniqueChars = 4;
                o.Lockout.AllowedForNewUsers = true;
                o.Lockout.MaxFailedAccessAttempts = 5;
                o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            })
            .AddSignInManager()
            .AddEntityFrameworkStores<KanbanDbContext>();

        return services;
    }
}
