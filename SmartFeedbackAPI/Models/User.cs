using System.ComponentModel.DataAnnotations;

namespace SmartFeedbackAPI.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [MinLength(3, ErrorMessage = "Full name must be at least 3 characters")]
    public string FullName { get; set; } = "";

    [Required]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = "";

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    public string PasswordHash { get; set; } = "";

    public string Gender { get; set; } = "";

    public bool IsAdmin { get; set; } = false;
}
