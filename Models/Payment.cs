namespace Library_Management.Models;

public class Payment
{
    public int Id { get; set; }
    public int FineId { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public string? TransactionReference { get; set; }
    public DateTime PaidAt { get; set; }
    public int? ProcessedByUserId { get; set; }
}