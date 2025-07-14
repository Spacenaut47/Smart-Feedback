using System.ComponentModel.DataAnnotations;

namespace SmartFeedbackAPI.DTOs
{
    public class FeedbackDto
{
    public string Heading { get; set; } = "";
    public string Category { get; set; } = "";
    public string Subcategory { get; set; } = "";
    public string Message { get; set; } = "";
    public string? ImageUrl { get; set; } = null;
}

}
