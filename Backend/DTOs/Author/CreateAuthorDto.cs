namespace Library_Management.DTOs.Author;

public class CreateAuthorDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Biography { get; set; }
    public string? Country { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? PhotoUrl { get; set; }
}