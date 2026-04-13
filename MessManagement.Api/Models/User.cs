namespace MessManagement.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required string Role { get; set; } // Admin, Student, Staff
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Attendance>? Attendances { get; set; }
        public ICollection<Payment>? Payments { get; set; }
        public ICollection<Feedback>? Feedbacks { get; set; }
        public ICollection<Leave>? Leaves { get; set; }
    }
}
