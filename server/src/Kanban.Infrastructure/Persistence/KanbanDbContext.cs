using Kanban.Domain.Boards;
using Kanban.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Kanban.Infrastructure.Persistence;

public sealed class KanbanDbContext(DbContextOptions<KanbanDbContext> options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Board> Boards => Set<Board>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<AppUser>(u => u.Property(x => x.DisplayName).HasMaxLength(60));

        builder.Entity<Board>(b =>
        {
            b.ToTable("Boards");
            b.HasKey(x => x.Id);
            b.Property(x => x.OwnerId).IsRequired().HasMaxLength(450);
            b.HasIndex(x => x.OwnerId).IsUnique();
            b.Property(x => x.Name).IsRequired().HasMaxLength(100);
            b.HasOne<AppUser>().WithMany().HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Cascade);

            b.OwnsMany(x => x.Members, m =>
            {
                m.ToTable("BoardMembers");
                m.WithOwner().HasForeignKey("BoardId");
                m.HasKey(x => x.Id);
                m.Property(x => x.Id).ValueGeneratedNever();
                m.Property(x => x.Name).IsRequired().HasMaxLength(40);
                m.Property(x => x.Role).IsRequired().HasMaxLength(60);
                m.Property(x => x.Initials).IsRequired().HasMaxLength(4);
                m.Property(x => x.Hue).IsRequired().HasMaxLength(20);
            });
            b.Navigation(x => x.Members).UsePropertyAccessMode(PropertyAccessMode.Field);

            b.HasMany(x => x.Tasks).WithOne().HasForeignKey(t => t.BoardId).OnDelete(DeleteBehavior.Cascade);
            b.Navigation(x => x.Tasks).UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        builder.Entity<SprintTask>(t =>
        {
            t.ToTable("Tasks");
            t.HasKey(x => x.Id);
            t.Property(x => x.Id).ValueGeneratedOnAdd();
            t.Property(x => x.Title).IsRequired().HasMaxLength(Rules.TitleMax);
            t.Property(x => x.Description).IsRequired().HasMaxLength(Rules.DescriptionMax);
            t.Property(x => x.Assignee).IsRequired().HasMaxLength(40);
            t.Property(x => x.Tag).IsRequired().HasMaxLength(40);
            t.HasIndex(x => new { x.BoardId, x.Lane });

            t.OwnsMany(x => x.Subtasks, s =>
            {
                s.ToTable("Subtasks");
                s.WithOwner().HasForeignKey("TaskId");
                s.HasKey("TaskId", nameof(Subtask.Id));
                s.Property(x => x.Id).ValueGeneratedNever();
                s.Property(x => x.Text).IsRequired().HasMaxLength(Rules.SubtaskTextMax);
            });
            t.Navigation(x => x.Subtasks).UsePropertyAccessMode(PropertyAccessMode.Field);
        });
    }
}
