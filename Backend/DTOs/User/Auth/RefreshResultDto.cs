namespace Library_Management.DTOs.User.Auth;

public class RefreshResultDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}