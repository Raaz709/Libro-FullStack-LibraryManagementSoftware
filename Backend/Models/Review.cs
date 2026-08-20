namespace Library_Management.Models;

public class Review
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int BookId { get; set; }
    public byte Rating { get; set; }
    public string? Comment { get; set; }
    public string Status { get; set; } = "Published";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class ReviewSummary
{
    public double AverageRating { get; set; }
    public int Count { get; set; }
}