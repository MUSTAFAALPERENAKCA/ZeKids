using Microsoft.AspNetCore.Mvc;
using ZeKids.API.Services;
using ZeKids.Core.DTOs;

namespace ZeKids.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var response = await _authService.RegisterAsync(dto);
            return Ok(new { message = "Kayıt başarılı. Lütfen e-postanızı kontrol edin.", data = response });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var response = await _authService.LoginAsync(dto);
            return Ok(new { message = "Giriş başarılı", data = response });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
    {
        var success = await _authService.VerifyEmailAsync(dto.Token);
        
        if (!success)
        {
            return BadRequest(new { message = "Geçersiz veya süresi dolmuş doğrulama linki" });
        }

        return Ok(new { message = "E-posta başarıyla doğrulandı" });
    }
}

public class VerifyEmailDto
{
    public string Token { get; set; } = string.Empty;
}
