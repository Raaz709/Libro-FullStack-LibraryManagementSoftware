namespace Library_Management.Models;

public class ActivityLog
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? Action { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime? CreatedAt { get; set; }
}