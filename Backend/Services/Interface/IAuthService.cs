using Library_Management.DTOs.User.Auth;

namespace Library_Management.Services.Interface;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request, string? ipAddress);
    Task<int> RegisterAsync(RegisterRequestDto request);
    Task<RefreshResultDto?> RefreshTokenAsync(string refreshToken, string? ipAddress);
    Task<bool> LogoutAsync(string refreshToken, string? ipAddress);
}