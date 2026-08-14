namespace Library_Management.Services.Interface;

public interface IJwtService
{
    string GenerateToken(int userId, string email, int roleId);
}