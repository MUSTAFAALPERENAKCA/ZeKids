using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ZeKids.Core.DTOs;
using ZeKids.Core.Entities;
using ZeKids.Infrastructure.Data;
using ZeKids.Infrastructure.Email;
using BCrypt.Net;

namespace ZeKids.API.Services;

public class AuthService
{
    private readonly ApplicationDbContext _context;
    private readonly EmailService _emailService;
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;

    public AuthService(
        ApplicationDbContext context,
        EmailService emailService,
        string jwtSecret,
        string jwtIssuer,
        string jwtAudience)
    {
        _context = context;
        _emailService = emailService;
        _jwtSecret = jwtSecret;
        _jwtIssuer = jwtIssuer;
        _jwtAudience = jwtAudience;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Check if user exists
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            throw new Exception("Bu e-posta adresi zaten kayıtlı.");
        }

        // Create user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            IsEmailVerified = true, // GEÇICI: Email doğrulamayı bypass et
            VerificationToken = null,
            Role = "Parent",
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        // Debug: Verify the user was actually saved
        var savedUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (savedUser == null)
        {
            throw new Exception("HATA: Kullanıcı database'e kaydedilemedi!");
        }

        // Send verification email
        await _emailService.SendVerificationEmailAsync(user.Email, user.VerificationToken);

        return new AuthResponseDto
        {
            Token = string.Empty,
            Email = user.Email,
            Role = user.Role,
            IsEmailVerified = false
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        
        Console.WriteLine($"🔍 DEBUG Login - Email: {dto.Email}");
        Console.WriteLine($"🔍 DEBUG User found: {user != null}");
        if (user != null)
        {
            Console.WriteLine($"🔍 DEBUG User ID: {user.Id}");
            Console.WriteLine($"🔍 DEBUG User Role: {user.Role}");
            Console.WriteLine($"🔍 DEBUG User Email: {user.Email}");
        }
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new Exception("E-posta veya şifre hatalı.");
        }

        Console.WriteLine($"✅ DEBUG Password verified, generating token for role: {user.Role}");
        var token = GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            Role = user.Role,
            IsEmailVerified = user.IsEmailVerified
        };
    }

    public async Task<bool> VerifyEmailAsync(string token)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.VerificationToken == token);
        
        if (user == null)
        {
            return false;
        }

        user.IsEmailVerified = true;
        user.VerificationToken = null;
        await _context.SaveChangesAsync();

        return true;
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("IsEmailVerified", user.IsEmailVerified.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
