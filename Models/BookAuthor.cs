namespace Library_Management.Models;

public class BookAuthor
{
    public int BookId { get; set; }
    public int AuthorId { get; set; }
    public bool IsPrimary { get; set; } = false;

    // Optional navigation properties if returning detailed view
    public string? AuthorFirstName { get; set; }
    public string? AuthorLastName { get; set; }
}