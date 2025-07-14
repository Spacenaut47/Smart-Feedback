using System.ComponentModel.DataAnnotations;

namespace SmartFeedbackAPI.Models;
public class Feedback
{
    public int Id { get; set; }

    [Required]
    public string Heading { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string Subcategory { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }  // ✅ NEW

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
