using MessManagement.Api.Data;
using MessManagement.Api.DTOs;
using MessManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MessManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InventoryController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET: api/inventory
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.InventoryItems.ToListAsync();
            return Ok(items);
        }

        // ✅ GET: api/inventory/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.InventoryItems.FindAsync(id);
            if (item == null) return NotFound();

            return Ok(item);
        }

        // ✅ POST: api/inventory (Admin only)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(InventoryItemDto dto)
        {
            var item = new InventoryItem
            {
                ItemName = dto.ItemName,
                Category = dto.Category,
                Quantity = dto.Quantity,
                Unit = dto.Unit,
                MinStockLevel = dto.MinStockLevel,
                LastUpdated = DateTime.UtcNow
            };

            _context.InventoryItems.Add(item);
            await _context.SaveChangesAsync();

            return Ok(item);
        }

        // ✅ PUT: api/inventory/5 (Admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, InventoryItemDto dto)
        {
            var item = await _context.InventoryItems.FindAsync(id);
            if (item == null) return NotFound();

            item.ItemName = dto.ItemName;
            item.Category = dto.Category;
            item.Quantity = dto.Quantity;
            item.Unit = dto.Unit;
            item.MinStockLevel = dto.MinStockLevel;
            item.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(item);
        }

        // ✅ DELETE: api/inventory/5 (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.InventoryItems.FindAsync(id);
            if (item == null) return NotFound();

            _context.InventoryItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok("Deleted successfully");
        }
    }
}