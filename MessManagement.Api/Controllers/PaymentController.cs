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
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentController(AppDbContext context)
        {
            _context = context;
        }

        // Admin can view all payments
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.User)
                .Select(p => new
                {
                    p.Id,
                    p.UserId,
                    UserName = p.User!.FullName,
                    p.Amount,
                    p.Status,
                    p.InvoiceMonth,
                    p.DatePaid
                })
                .OrderByDescending(p => p.Id)
                .ToListAsync();

            return Ok(payments);
        }

        // Students view their own
        [HttpGet("my")]
        public async Task<IActionResult> GetMyPayments()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int userId = int.Parse(userIdStr);

            var payments = await _context.Payments
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.Id)
                .ToListAsync();

            return Ok(payments);
        }

        // Admin creates a new payment invoice
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateInvoice([FromBody] PaymentDto dto)
        {
            var payment = new Payment
            {
                UserId = dto.UserId,
                Amount = dto.Amount,
                Status = "Pending",
                InvoiceMonth = dto.InvoiceMonth
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            return Ok(payment);
        }

        // Mark as paid
        [HttpPut("{id}/pay")]
        public async Task<IActionResult> PayInvoice(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null) return NotFound("Invoice not found.");

            // Basic validation - check if the user resolving this is the owner or an admin
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (currentRole != "Admin" && payment.UserId.ToString() != currentUserId)
            {
                return Forbid();
            }

            payment.Status = "Paid";
            payment.DatePaid = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(payment);
        }
    }
}
