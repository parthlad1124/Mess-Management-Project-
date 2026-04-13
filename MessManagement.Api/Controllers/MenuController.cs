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
    [Authorize] // Requires valid JWT for any action
    public class MenuController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MenuController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMenu()
        {
            // Anyone authed can see the menu
            var menu = await _context.Menus.ToListAsync();
            return Ok(menu);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")] // Only Admins can add
        public async Task<IActionResult> AddMenu([FromBody] MenuDto dto)
        {
            var menu = new Menu
            {
                DayOfWeek = dto.DayOfWeek,
                Breakfast = dto.Breakfast,
                Lunch = dto.Lunch,
                Dinner = dto.Dinner
            };

            _context.Menus.Add(menu);
            await _context.SaveChangesAsync();
            return Ok(menu);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateMenu(int id, [FromBody] MenuDto dto)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null) return NotFound("Menu item not found");

            menu.DayOfWeek = dto.DayOfWeek;
            menu.Breakfast = dto.Breakfast;
            menu.Lunch = dto.Lunch;
            menu.Dinner = dto.Dinner;

            await _context.SaveChangesAsync();
            return Ok(menu);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMenu(int id)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null) return NotFound("Menu item not found");

            _context.Menus.Remove(menu);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Menu deleted successfully" });
        }
    }
}
