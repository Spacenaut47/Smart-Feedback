using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFeedbackAPI.Data;
using SmartFeedbackAPI.DTOs;

namespace SmartFeedbackAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")] // Only admin can access
public class AdminController : ControllerBase
{
    private readonly DataContext _context;

    public AdminController(DataContext context)
    {
        _context = context;
    }

    // GET: api/admin/all-feedbacks
    [HttpGet("all-feedbacks")]
    public async Task<IActionResult> GetAllFeedbacks()
    {
        var feedbacks = await _context.Feedbacks
            .Include(f => f.User) // this works only if Feedback.User exists
            .Select(f => new
            {
                f.Id,
                f.Heading,
                f.Category,
                f.Subcategory,
                f.Message,
                f.SubmittedAt,
                f.Status,
                f.ImageUrl,
                FullName = f.User.FullName,
                Email = f.User.Email
            })
            .OrderByDescending(f => f.SubmittedAt)
            .ToListAsync();

        return Ok(feedbacks);
    }


    // PUT: api/admin/update-status/{feedbackId}
    [HttpPut("update-feedback-status/{feedbackId}")]
    public async Task<IActionResult> UpdateFeedbackStatus(int feedbackId, [FromBody] UpdateStatusDto dto)
    {
        var feedback = await _context.Feedbacks.FindAsync(feedbackId);
        if (feedback == null)
            return NotFound("Feedback not found");

        feedback.Status = dto.Status;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Status updated successfully" });
    }

    // DELETE: api/admin/delete-feedback/{feedbackId}
    [HttpDelete("delete-feedback/{feedbackId}")]
    public async Task<IActionResult> DeleteFeedback(int feedbackId)
    {
        var feedback = await _context.Feedbacks.FindAsync(feedbackId);
        if (feedback == null)
            return NotFound("Feedback not found");

        _context.Feedbacks.Remove(feedback);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Feedback deleted successfully" });
    }

    [HttpGet("users-with-feedbacks")]
    public async Task<IActionResult> GetUsersWithFeedbacks()
    {
        var usersWithFeedbacks = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                Feedbacks = _context.Feedbacks
                    .Where(f => f.UserId == u.Id)
                    .OrderByDescending(f => f.SubmittedAt)
                    .Select(f => new
                    {
                        f.Id,
                        f.Heading,
                        f.Category,
                        f.Subcategory,
                        f.Message,
                        f.SubmittedAt
                    }).ToList()
            })
            .ToListAsync();

        return Ok(usersWithFeedbacks);
    }

}
