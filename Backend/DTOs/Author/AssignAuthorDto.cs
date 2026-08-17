namespace Library_Management.DTOs.Author;

public class AssignAuthorDto
{
    public int AuthorId { get; set; }
    public bool IsPrimary { get; set; } = false;
}