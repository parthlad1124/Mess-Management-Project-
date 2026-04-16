namespace MessManagement.Api.DTOs
{
    public class RegisterDto
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; } // Admin, Student, Staff
    }

    public class LoginDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class AuthResponseDto
    {
        public required string Token { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
        public required string FullName { get; set; }
    }

       // ==============================
    // Admin User Management DTOs
    // ==============================

    public class UserListDto
    {
        public int Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateUserDto
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; } // Only Student or Staff from admin page
    }

    public class UpdateUserDto
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; } // Only Student or Staff from admin page
    }
}
