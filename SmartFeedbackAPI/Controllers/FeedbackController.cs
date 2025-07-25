using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFeedbackAPI.Data;
using SmartFeedbackAPI.DTOs;
using SmartFeedbackAPI.Models;
using System.Security.Claims;

namespace SmartFeedbackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly DataContext _context;

        public FeedbackController(DataContext context)
        {
            _context = context;
        }

        // POST: api/feedback/submit
        [Authorize]
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitFeedback([FromBody] FeedbackDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var feedback = new Feedback
            {
                Heading = dto.Heading,
                Category = dto.Category,
                Subcategory = dto.Subcategory,
                Message = dto.Message,
                SubmittedAt = DateTime.UtcNow,
                UserId = userId.Value,
                ImageUrl = dto.ImageUrl
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Feedback submitted successfully." });
        }

        // GET: api/feedback/my-feedbacks
        [Authorize]
        [HttpGet("my-feedbacks")]
        public async Task<IActionResult> GetMyFeedbacks()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var feedbacks = await _context.Feedbacks
                .Where(f => f.UserId == userId.Value)
                .OrderByDescending(f => f.SubmittedAt)
                .Select(f => new
                {
                    f.Heading,
                    f.Category,
                    f.Subcategory,
                    f.Message,
                    f.SubmittedAt,
                    f.ImageUrl
                })
                .ToListAsync();

            return Ok(feedbacks);
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile image, [FromServices] BlobStorageService blobService)
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image provided.");

            var imageUrl = await blobService.UploadImageAsync(image);
            return Ok(new { imageUrl });
        }

        // Utility method to extract User ID from JWT
        private int? GetUserId()
        {
            if (User.Identity is ClaimsIdentity identity)
            {
                var userIdClaim = identity.FindFirst(ClaimTypes.NameIdentifier);
                if (int.TryParse(userIdClaim?.Value, out int userId))
                {
                    return userId;
                }
            }

            return null;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("update-status/{feedbackId}")]
        public async Task<IActionResult> UpdateFeedbackStatus(int feedbackId, [FromBody] string newStatus)
        {
            var feedback = await _context.Feedbacks.Include(f => f.User).FirstOrDefaultAsync(f => f.Id == feedbackId);
            if (feedback == null) return NotFound("Feedback not found.");

            var oldStatus = feedback.Status;
            feedback.Status = newStatus;

            await _context.SaveChangesAsync();

            // Log the status change
            var adminId = GetUserId();
            if (adminId != null)
            {
                var log = new AuditLog
                {
                    ActionType = "StatusChange",
                    Description = $"Changed status of feedback ID {feedbackId} from '{oldStatus}' to '{newStatus}' for user {feedback.User?.FullName ?? "Unknown"}",
                    Timestamp = DateTime.UtcNow,
                    PerformedByUserId = adminId.Value,
                    TargetUserId = feedback.UserId
                };

                _context.AuditLogs.Add(log);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Feedback status updated successfully." });
        }

    }
}
