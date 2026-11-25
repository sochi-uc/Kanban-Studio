using Kanban.Application.Boards;
using Microsoft.Extensions.DependencyInjection;

namespace Kanban.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<BoardService>();
        return services;
    }
}
