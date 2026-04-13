using Microsoft.EntityFrameworkCore;
using MessManagement.Api.Models;

namespace MessManagement.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Menu> Menus { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<Leave> Leaves { get; set; }
        public DbSet<InventoryItem> InventoryItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Explicitly map entity names to match requested tables
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Menu>().ToTable("Menu");
            modelBuilder.Entity<Attendance>().ToTable("Attendance");
            modelBuilder.Entity<Payment>().ToTable("Payments");
            modelBuilder.Entity<Feedback>().ToTable("Feedback");
            modelBuilder.Entity<Leave>().ToTable("Leave");
            modelBuilder.Entity<InventoryItem>().ToTable("InventoryItems");

            // Make emails unique
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}
