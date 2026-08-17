using Library_Management.DTOs.User.Auth;

namespace Library_Management.Services.Interface;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);

    Task<int> RegisterAsync(RegisterRequestDto request);
}