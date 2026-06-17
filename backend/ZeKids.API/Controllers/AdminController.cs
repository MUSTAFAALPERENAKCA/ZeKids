using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeKids.Infrastructure.Data;

namespace ZeKids.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics()
    {
        var totalUsers = await _context.Users.CountAsync();
        var activeSubscriptions = await _context.Subscriptions
            .Where(s => s.Status == "Active")
            .CountAsync();

        var mrr = await _context.Subscriptions
            .Where(s => s.Status == "Active")
            .SumAsync(s => s.Price);

        // Churn Rate (son 30 gün)
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var cancelledLast30Days = await _context.Subscriptions
            .Where(s => s.Status == "Cancelled" && s.CreatedAt >= thirtyDaysAgo)
            .CountAsync();

        var totalSubscriptionsLast30Days = await _context.Subscriptions
            .Where(s => s.CreatedAt >= thirtyDaysAgo)
            .CountAsync();

        var churnRate = totalSubscriptionsLast30Days > 0
            ? (double)cancelledLast30Days / totalSubscriptionsLast30Days * 100
            : 0;

        // Revenue by month (son 6 ay)
        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
        var revenueByMonth = await _context.Subscriptions
            .Where(s => s.CreatedAt >= sixMonthsAgo && s.Status == "Active")
            .GroupBy(s => new { s.CreatedAt.Year, s.CreatedAt.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Revenue = g.Sum(s => s.Price),
                Count = g.Count()
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();

        return Ok(new
        {
            totalUsers,
            activeSubscriptions,
            mrr,
            churnRate = Math.Round(churnRate, 2),
            revenueByMonth
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _context.Users
            .Include(u => u.Children)
            .Include(u => u.Subscription)
            .OrderByDescending(u => u.CreatedAt);

        var total = await query.CountAsync();
        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.Role,
                u.IsEmailVerified,
                u.CreatedAt,
                ChildrenCount = u.Children.Count,
                SubscriptionStatus = u.Subscription != null ? u.Subscription.Status : "None",
                SubscriptionPlan = u.Subscription != null ? u.Subscription.PlanName : null
            })
            .ToListAsync();

        return Ok(new
        {
            total,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(total / (double)pageSize),
            users
        });
    }

    [HttpPut("system-settings")]
    public async Task<IActionResult> UpdateSystemSetting([FromBody] UpdateSettingDto dto)
    {
        var setting = await _context.SystemSettings
            .FirstOrDefaultAsync(s => s.Key == dto.Key);

        if (setting == null)
        {
            setting = new Core.Entities.SystemSetting
            {
                Id = Guid.NewGuid(),
                Key = dto.Key,
                Value = dto.Value,
                UpdatedAt = DateTime.UtcNow
            };
            _context.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = dto.Value;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Ayar güncellendi", setting });
    }

    [HttpGet("system-settings/{key}")]
    public async Task<IActionResult> GetSystemSetting(string key)
    {
        var setting = await _context.SystemSettings
            .FirstOrDefaultAsync(s => s.Key == key);

        if (setting == null)
        {
            return NotFound(new { message = "Ayar bulunamadı" });
        }

        return Ok(setting);
    }

    [HttpGet("game-stats")]
    public async Task<IActionResult> GetGameStats()
    {
        var totalGames = await _context.GameLogs.CountAsync();
        
        var gamesByType = await _context.GameLogs
            .GroupBy(gl => gl.GameId)
            .Select(g => new
            {
                GameId = g.Key,
                Count = g.Count(),
                AvgScore = g.Average(x => x.Score),
                AvgMRT = g.Where(x => x.MRT != null).Average(x => x.MRT),
                AvgRTV = g.Where(x => x.RTV != null).Average(x => x.RTV)
            })
            .ToListAsync();

        return Ok(new
        {
            totalGames,
            gamesByType
        });
    }
}

public class UpdateSettingDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
