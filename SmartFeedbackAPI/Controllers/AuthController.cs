using SmartFeedbackAPI.Data;
using SmartFeedbackAPI.Models;
using SmartFeedbackAPI.Services;
using SmartFeedbackAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace SmartFeedbackAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly DataContext _context;
    private readonly TokenService _tokenService;

    public AuthController(DataContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User user)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            return BadRequest("Email already exists");

        if (!IsStrongPassword(user.PasswordHash))
            return BadRequest("Password must be at least 8 characters, include uppercase, lowercase, number, and symbol.");

        user.PasswordHash = HashPassword(user.PasswordHash);
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        return Ok("User registered");
    }

    private bool IsStrongPassword(string password)
    {
        return password.Length >= 8 &&
               password.Any(char.IsUpper) &&
               password.Any(char.IsLower) &&
               password.Any(char.IsDigit) &&
               password.Any(ch => "!@#$%^&*()_+[]{}|;':\",.<>?/\\`~".Contains(ch));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");

        var token = _tokenService.CreateToken(user);

        if (user.IsAdmin)
        {
            var log = new AuditLog
            {
                ActionType = "AdminLogin",
                Description = $"Admin {user.FullName} logged in.",
                Timestamp = DateTime.UtcNow,
                PerformedByUserId = user.Id
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            token,
            isAdmin = user.IsAdmin,
            fullName = user.FullName
        });
    }


    private string HashPassword(string password) =>
        Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(password)));

    private bool VerifyPassword(string password, string storedHash) =>
        HashPassword(password) == storedHash;
}

