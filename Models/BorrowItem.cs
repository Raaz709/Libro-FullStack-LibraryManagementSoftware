namespace Library_Management.Models;

public class BorrowItem
{
    public int Id { get; set; }
    public int BorrowTransactionId { get; set; }
    public int BookCopyId { get; set; }
    public DateTime BorrowedAt { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? ReturnedAt { get; set; }
    public string Status { get; set; } = "Borrowed";
    public int RenewalCount { get; set; } = 0;
    public string? ConditionAtBorrow { get; set; }
    public string? ConditionAtReturn { get; set; }
}