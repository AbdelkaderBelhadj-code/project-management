using GProjets.Server.Models;
using GProjets.Server.Models.Entites;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GProjets.Server.Data
{
    public class GprojetsDbContext : IdentityDbContext
    {
        public GprojetsDbContext(DbContextOptions<GprojetsDbContext> options) : base(options)
        {
        }

        public new DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Tache> Taches { get; set; }
        public DbSet<UserProject> UserProjects { get; set; }
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure many-to-many User <-> Project
            modelBuilder.Entity<UserProject>()
                .HasKey(up => new { up.UserId, up.ProjectId });

            modelBuilder.Entity<UserProject>()
                .HasOne(up => up.User)
                .WithMany()
                .HasForeignKey(up => up.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Avoid cascade loop

            modelBuilder.Entity<UserProject>()
                .HasOne(up => up.Project)
                .WithMany(p => p.UserProjects)
                .HasForeignKey(up => up.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Tache>()
                .HasOne(t => t.AssignedTo)
                .WithMany()
                .HasForeignKey(t => t.AssignedToId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure Tache -> Project
            modelBuilder.Entity<Tache>()
                .HasOne(t => t.Project)
                .WithMany(p => p.Taches)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Project -> User (Chef)
            modelBuilder.Entity<Project>()
                .HasOne(p => p.Chef)
                .WithMany()
                .HasForeignKey(p => p.ChefId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade conflicts
        }

    }
}
