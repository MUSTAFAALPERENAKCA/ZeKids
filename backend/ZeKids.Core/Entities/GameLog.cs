using System.Text.Json;

namespace ZeKids.Core.Entities;

public class GameLog
{
    public Guid Id { get; set; }
    public Guid ChildId { get; set; }
    public string GameId { get; set; } = string.Empty;
    public int Score { get; set; }
    public int Duration { get; set; }
    public JsonDocument? RawData { get; set; }
    public double? MRT { get; set; } // Mean Reaction Time
    public double? RTV { get; set; } // Reaction Time Variability (SD)
    public int? OmissionErrors { get; set; }
    public int? CommissionErrors { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public Child Child { get; set; } = null!;
}
