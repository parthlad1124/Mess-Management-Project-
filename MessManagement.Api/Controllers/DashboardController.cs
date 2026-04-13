using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MessManagement.Api.Data;

namespace MessManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("today-stats")]
        [Authorize(Roles = "Admin,Staff,Student")]
        public async Task<IActionResult> GetTodayStats([FromQuery] DateTime? date = null)
        {
            var targetDate = date?.Date ?? DateTime.UtcNow.Date;

            // Get total registered users by role
            var totalStudents = await _context.Users.CountAsync(u => u.Role == "Student");
            var totalStaff = await _context.Users.CountAsync(u => u.Role == "Staff");

            // Calculate users on leave today for specific meals (approved only)
            var activeLeavesToday = await _context.Leaves
                .Include(l => l.User)
                .Where(l => l.Status == "Approved" 
                            && l.StartDate.Date <= targetDate 
                            && l.EndDate.Date >= targetDate)
                .ToListAsync();

            // Students on leave per meal (Count where leave covers the meal)
            var studentLeavesToday = activeLeavesToday.Where(l => l.User!.Role == "Student").ToList();
            var breakfastLeaves = studentLeavesToday.Count(l => l.BreakfastLeave);
            var lunchLeaves = studentLeavesToday.Count(l => l.LunchLeave);
            var dinnerLeaves = studentLeavesToday.Count(l => l.DinnerLeave);

            // Total students on leave overall (for "Students on leave today" metric)
            var studentsOnLeave = studentLeavesToday.Count();
            
            // Staff leave 
            var staffOnLeave = activeLeavesToday.Count(l => l.User!.Role == "Staff");

            // Calculate expected counts for meals
            var expectedBreakfast = totalStudents - breakfastLeaves;
            var expectedLunch = totalStudents - lunchLeaves;
            var expectedDinner = totalStudents - dinnerLeaves;
            var expectedStaffToday = totalStaff - staffOnLeave;

            // Additional stats
            var paymentsTotal = await _context.Payments
                .Where(p => p.Status == "Paid")
                .SumAsync(p => p.Amount);
            var feedbackCount = await _context.Feedbacks.CountAsync();
            var menuItemsCount = await _context.Menus.CountAsync();
            var dayOfWeek = targetDate.DayOfWeek.ToString();
            var todayMenu = await _context.Menus.FirstOrDefaultAsync(m => m.DayOfWeek == dayOfWeek);

            return Ok(new
            {
                totalStudents,
                totalStaff,
                studentsOnLeave,
                staffOnLeave,
                expectedBreakfast,
                expectedLunch,
                expectedDinner,
                expectedStaffToday,
                paymentsTotal,
                feedbackCount,
                menuItemsCount,
                todayMenu
            });
        }
    }
}
