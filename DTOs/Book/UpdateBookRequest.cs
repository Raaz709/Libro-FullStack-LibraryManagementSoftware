namespace Library_Management.DTOs.Book;

public class UpdateBookRequest
{
    public string ISBN { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Subtitle { get; set; }

    public string? Description { get; set; }

    public string? Language { get; set; }

    public string? Edition { get; set; }

    public int PublisherId { get; set; }

    public DateTime? PublishedDate { get; set; }

    public decimal? Price { get; set; }

    public string? CoverImageUrl { get; set; }

    public string Status { get; set; } = "Active";
}