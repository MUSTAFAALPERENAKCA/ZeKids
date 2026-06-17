using System.Text.Json;

namespace ZeKids.Core.Entities;

public class Child
{
    public Guid Id { get; set; }
    public Guid ParentId { get; set; }
    public string NicknameEncrypted { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public JsonDocument? BaselineAttentionScore { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public User Parent { get; set; } = null!;
    public ICollection<GameLog> GameLogs { get; set; } = new List<GameLog>();
}
