using Microsoft.EntityFrameworkCore;
using ZeKids.Core.Entities;

namespace ZeKids.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Child> Children { get; set; }
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<GameLog> GameLogs { get; set; }
    public DbSet<SystemSetting> SystemSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
        });

        // Child configuration
        modelBuilder.Entity<Child>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NicknameEncrypted).IsRequired().HasMaxLength(512);
            entity.Property(e => e.Gender).HasMaxLength(50);
            entity.Property(e => e.BaselineAttentionScore).HasColumnType("jsonb");
            
            entity.HasOne(e => e.Parent)
                .WithMany(u => u.Children)
                .HasForeignKey(e => e.ParentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Subscription configuration
        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlanName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            
            entity.HasOne(e => e.User)
                .WithOne(u => u.Subscription)
                .HasForeignKey<Subscription>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // GameLog configuration
        modelBuilder.Entity<GameLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.GameId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.RawData).HasColumnType("jsonb");
            
            entity.HasOne(e => e.Child)
                .WithMany(c => c.GameLogs)
                .HasForeignKey(e => e.ChildId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => new { e.ChildId, e.CreatedAt });
        });

        // SystemSetting configuration
        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Key).IsUnique();
            entity.Property(e => e.Key).IsRequired().HasMaxLength(100);
        });
    }
}
