namespace Library_Management.Models;

public class BorrowTransaction
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? ProcessedByUserId { get; set; }
    public DateTime BorrowedAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}