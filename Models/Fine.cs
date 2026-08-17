namespace Library_Management.Models;

public class Fine
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? BorrowItemId { get; set; }
    public string Type { get; set; } = "Overdue";
    public decimal Amount { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = "Unpaid";
    public DateTime CreatedAt { get; set; }
    public DateTime? WaivedAt { get; set; }
    public int? WaivedByUserId { get; set; }
}