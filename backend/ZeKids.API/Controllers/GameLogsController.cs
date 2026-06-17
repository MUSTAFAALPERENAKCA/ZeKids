using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeKids.API.Services;
using ZeKids.Core.DTOs;
using ZeKids.Core.Entities;
using ZeKids.Infrastructure.Data;

namespace ZeKids.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GameLogsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ReportingService _reportingService;

    public GameLogsController(ApplicationDbContext context, ReportingService reportingService)
    {
        _context = context;
        _reportingService = reportingService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateGameLog([FromBody] CreateGameLogDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        // Verify child belongs to user
        var child = await _context.Children
            .FirstOrDefaultAsync(c => c.Id == dto.ChildId && c.ParentId == userId);

        if (child == null)
        {
            return BadRequest(new { message = "Geçersiz çocuk ID" });
        }

        // Calculate clinical metrics
        double? mrt = null;
        double? rtv = null;

        if (dto.ReactionTimes != null && dto.ReactionTimes.Count > 0)
        {
            mrt = _reportingService.CalculateMRT(dto.ReactionTimes);
            rtv = _reportingService.CalculateRTV(dto.ReactionTimes);
        }

        var gameLog = new GameLog
        {
            Id = Guid.NewGuid(),
            ChildId = dto.ChildId,
            GameId = dto.GameId,
            Score = dto.Score,
            Duration = dto.Duration,
            RawData = dto.RawData != null ? JsonDocument.Parse(JsonSerializer.Serialize(dto.RawData)) : null,
            MRT = mrt,
            RTV = rtv,
            CreatedAt = DateTime.UtcNow
        };

        _context.GameLogs.Add(gameLog);
        await _context.SaveChangesAsync();

        return Ok(new 
        { 
            message = "Oyun kaydedildi", 
            gameLogId = gameLog.Id,
            mrt,
            rtv
        });
    }

    [HttpGet("child/{childId}")]
    public async Task<IActionResult> GetChildGameLogs(Guid childId)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var child = await _context.Children
            .FirstOrDefaultAsync(c => c.Id == childId && c.ParentId == userId);

        if (child == null)
        {
            return BadRequest(new { message = "Geçersiz çocuk ID" });
        }

        var logs = await _context.GameLogs
            .Where(gl => gl.ChildId == childId)
            .OrderByDescending(gl => gl.CreatedAt)
            .Take(50)
            .Select(gl => new GameLogResponseDto
            {
                Id = gl.Id,
                GameId = gl.GameId,
                Score = gl.Score,
                Duration = gl.Duration,
                MRT = gl.MRT,
                RTV = gl.RTV,
                OmissionErrors = gl.OmissionErrors,
                CommissionErrors = gl.CommissionErrors,
                CreatedAt = gl.CreatedAt
            })
            .ToListAsync();

        return Ok(logs);
    }

    [HttpGet("child/{childId}/reports")]
    public async Task<IActionResult> GetChildReports(Guid childId)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var child = await _context.Children
            .FirstOrDefaultAsync(c => c.Id == childId && c.ParentId == userId);

        if (child == null)
        {
            return BadRequest(new { message = "Geçersiz çocuk ID" });
        }

        var logs = await _context.GameLogs
            .Where(gl => gl.ChildId == childId && gl.MRT != null)
            .OrderBy(gl => gl.CreatedAt)
            .Select(gl => new
            {
                gl.CreatedAt,
                gl.MRT,
                gl.RTV,
                gl.GameId
            })
            .ToListAsync();

        var latestRTV = logs.LastOrDefault()?.RTV ?? 0;
        var interpretation = _reportingService.GetInterpretation(latestRTV);

        return Ok(new
        {
            logs,
            interpretation,
            totalGames = logs.Count
        });
    }
}
