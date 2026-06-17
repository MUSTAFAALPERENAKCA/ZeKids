using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeKids.Core.DTOs;
using ZeKids.Core.Entities;
using ZeKids.Infrastructure.Data;
using ZeKids.Infrastructure.Security;

namespace ZeKids.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChildrenController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly EncryptionService _encryptionService;

    public ChildrenController(ApplicationDbContext context, EncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetChildren()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var children = await _context.Children
            .Where(c => c.ParentId == userId)
            .ToListAsync();

        var response = children.Select(c => new ChildResponseDto
        {
            Id = c.Id,
            Nickname = _encryptionService.Decrypt(c.NicknameEncrypted),
            Age = c.Age,
            Gender = c.Gender,
            CreatedAt = c.CreatedAt
        }).ToList();

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> CreateChild([FromBody] CreateChildDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var child = new Child
        {
            Id = Guid.NewGuid(),
            ParentId = userId,
            NicknameEncrypted = _encryptionService.Encrypt(dto.Nickname),
            Age = dto.Age,
            Gender = dto.Gender,
            CreatedAt = DateTime.UtcNow
        };

        _context.Children.Add(child);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Çocuk profili oluşturuldu", childId = child.Id });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChild(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var child = await _context.Children
            .FirstOrDefaultAsync(c => c.Id == id && c.ParentId == userId);

        if (child == null)
        {
            return NotFound(new { message = "Çocuk profili bulunamadı" });
        }

        _context.Children.Remove(child);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Çocuk profili silindi" });
    }
}
