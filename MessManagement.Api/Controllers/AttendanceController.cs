using System.Security.Claims;
using MessManagement.Api.Data;
using MessManagement.Api.Models;
using MessManagement.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MessManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttendanceController(AppDbContext context)
        {
            _context = context;
        }

        // Admin/Staff can see all attendance for a specific date
        [HttpGet("date/{date}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAttendanceByDate(DateTime date)
        {
            var attendances = await _context.Attendances
                .Include(a => a.User)
                .Where(a => a.Date.Date == date.Date)
                .Select(a => new
                {
                    a.Id,
                    a.UserId,
                    UserName = a.User!.FullName,
                    a.Date,
                    a.MealType,
                    a.Status
                })
                .ToListAsync();

            return Ok(attendances);
        }

        // Student can see their own attendance
        [HttpGet("my")]
        public async Task<IActionResult> GetMyAttendance()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int userId = int.Parse(userIdStr);

            var attendances = await _context.Attendances
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Date)
                .ToListAsync();

            return Ok(attendances);
        }

        // Admin/Staff can mark attendance
        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> MarkAttendance([FromBody] AttendanceDto dto)
        {
            // Check if already exists to prevent duplicates
            var existing = await _context.Attendances.FirstOrDefaultAsync(a => 
                a.UserId == dto.UserId && 
                a.Date.Date == dto.Date.Date && 
                a.MealType == dto.MealType);

            if (existing != null)
            {
                existing.Status = dto.Status;
                await _context.SaveChangesAsync();
                return Ok(existing);
            }

            var attendance = new Attendance
            {
                UserId = dto.UserId,
                Date = dto.Date.Date,
                MealType = dto.MealType,
                Status = dto.Status
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();
            return Ok(attendance);
        }
    }
}
