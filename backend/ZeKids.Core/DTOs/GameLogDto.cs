namespace ZeKids.Core.DTOs;

public class CreateGameLogDto
{
    public Guid ChildId { get; set; }
    public string GameId { get; set; } = string.Empty;
    public int Score { get; set; }
    public int Duration { get; set; }
    public List<double>? ReactionTimes { get; set; }
    public object? RawData { get; set; }
}

public class GameLogResponseDto
{
    public Guid Id { get; set; }
    public string GameId { get; set; } = string.Empty;
    public int Score { get; set; }
    public int Duration { get; set; }
    public double? MRT { get; set; }
    public double? RTV { get; set; }
    public int? OmissionErrors { get; set; }
    public int? CommissionErrors { get; set; }
    public DateTime CreatedAt { get; set; }
}
