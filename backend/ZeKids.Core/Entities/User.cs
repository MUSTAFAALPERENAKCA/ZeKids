namespace ZeKids.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsEmailVerified { get; set; }
    public string? VerificationToken { get; set; }
    public string Role { get; set; } = "Parent"; // "Admin" veya "Parent"
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public ICollection<Child> Children { get; set; } = new List<Child>();
    public Subscription? Subscription { get; set; }
}
