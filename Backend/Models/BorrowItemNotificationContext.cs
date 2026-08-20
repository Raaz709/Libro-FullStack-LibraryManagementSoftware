namespace Library_Management.Models;

public class BorrowItemNotificationContext
{
    public int UserId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
}