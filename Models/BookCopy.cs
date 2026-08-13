namespace Library_Management.Models;

public class BookCopy
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public int? ShelfId { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string? QRCode { get; set; }
    public string ConditionStatus { get; set; } = "Good";
    public string Status { get; set; } = "Available";
    public DateTime? PurchaseDate { get; set; }
    public decimal? Price { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}