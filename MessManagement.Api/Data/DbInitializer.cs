using MessManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MessManagement.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            // Ensure db is created
            if (context.Database.GetPendingMigrations().Any())
            {
                context.Database.Migrate();
            }

            // Seed Admin User if no users exist
            if (!context.Users.Any())
            {
                context.Users.Add(new User
                {
                    FullName = "System Admin",
                    Email = "admin@mess.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                });
                context.SaveChanges();
            }

            // Seed Initial Weekly Menu if no menu exists
            if (!context.Menus.Any())
            {
                var defaultMenus = new Menu[]
                {
                    new Menu { DayOfWeek = "Monday", Breakfast = "Oats & Fruits", Lunch = "Paneer Butter Masala, Rice", Dinner = "Pasta, Salad" },
                    new Menu { DayOfWeek = "Tuesday", Breakfast = "Pancakes, Syrup", Lunch = "Soya Chunks Curry, Beans", Dinner = "Mixed Veg Stir Fry, Noodles" },
                    new Menu { DayOfWeek = "Wednesday", Breakfast = "Poha, Jalebi", Lunch = "Vegetable Biryani", Dinner = "Grilled Paneer, Veggies" },
                    new Menu { DayOfWeek = "Thursday", Breakfast = "Cereal, Milk", Lunch = "Lentil Soup, Bread", Dinner = "Pizza Slice, Salad" },
                    new Menu { DayOfWeek = "Friday", Breakfast = "Yogurt, Granola", Lunch = "Veggie Burgers, Fries", Dinner = "Dal Makhani, Roti" },
                    new Menu { DayOfWeek = "Saturday", Breakfast = "Aloo Paratha, Curd", Lunch = "Paneer Tikka, Naan", Dinner = "Fried Rice, Manchurian" },
                    new Menu { DayOfWeek = "Sunday", Breakfast = "Masala Dosa, Chutney", Lunch = "Chole Bhature, Rice", Dinner = "Light Sandwiches, Soup" }
                };

                context.Menus.AddRange(defaultMenus);
                context.SaveChanges();
            }
        }
    }
}
