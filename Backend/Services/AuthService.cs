using BCrypt.Net;
using Library_Management.DTOs.User.Auth;
using Library_Management.Models;
using Library_Management.Repositories;
using Library_Management.Repositories.Interface;
using Library_Management.Services.Interface;

namespace Library_Management.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IJwtService jwtService,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request, string? ipAddress)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        if (user.Status != "Active")
        {
            return null;
        }

        var roleName = GetRoleName(user.RoleId);
        var accessToken = _jwtService.GenerateToken(user.Id, user.Email, roleName);
        var refreshToken = await IssueRefreshTokenAsync(user.Id, ipAddress);

        return new LoginResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            UserId = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            RoleId = user.RoleId
        };
    }

    public async Task<int> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);

        if (existingUser != null)
        {
            throw new InvalidOperationException("A user with this email already exists.");
        }

        if (request.RoleId != 1 && request.RoleId != 2)
        {
            throw new InvalidOperationException(
                "Only Student and Faculty accounts can self-register."
            );
        }

        if (request.RoleId == 2)
        {
            var facultyPassword = _configuration["Registration:FacultyPassword"];

            if (string.IsNullOrEmpty(facultyPassword) ||
                !string.Equals(
                    request.FacultyPassword,
                    facultyPassword,
                    StringComparison.Ordinal
                ))
            {
                throw new InvalidOperationException(
                    "Invalid faculty registration password."
                );
            }
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            RoleId = request.RoleId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            PasswordHash = passwordHash,
            Status = "Active",
            MembershipNumber = GenerateMembershipNumber()
        };

        return await _userRepository.CreateAsync(user);
    }

    private static string GenerateMembershipNumber()
    {
        var random = new Random();
        return $"LBM-{DateTime.UtcNow:yyyyMMddHHmmss}-{random.Next(1000, 9999)}";
    }

    public async Task<RefreshResultDto?> RefreshTokenAsync(string refreshToken, string? ipAddress)
    {
        var tokenHash = _jwtService.HashToken(refreshToken);
        var existingToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash);

        if (existingToken is null || !existingToken.IsActive)
        {
            return null;
        }

        var user = await _userRepository.GetByIdAsync(existingToken.UserId);

        if (user is null || user.Status != "Active")
        {
            return null;
        }

        // Rotate: issue a brand new refresh token, then retire the old one and link them
        var newRefreshTokenValue = _jwtService.GenerateRefreshToken();
        var newRefreshTokenHash = _jwtService.HashToken(newRefreshTokenValue);
        var expiryDays = _configuration.GetValue<int>("Jwt:RefreshTokenExpiryDays");

        var newTokenId = await _refreshTokenRepository.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = newRefreshTokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
            CreatedByIp = ipAddress
        });

        await _refreshTokenRepository.RevokeAsync(existingToken.Id, ipAddress, newTokenId);

        var roleName = GetRoleName(user.RoleId);
        var newAccessToken = _jwtService.GenerateToken(user.Id, user.Email, roleName);

        return new RefreshResultDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshTokenValue
        };
    }

    public async Task<bool> LogoutAsync(string refreshToken, string? ipAddress)
    {
        var tokenHash = _jwtService.HashToken(refreshToken);
        var existingToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash);

        if (existingToken is null || !existingToken.IsActive)
        {
            return false;
        }

        return await _refreshTokenRepository.RevokeAsync(existingToken.Id, ipAddress);
    }

    private async Task<string> IssueRefreshTokenAsync(int userId, string? ipAddress)
    {
        var refreshTokenValue = _jwtService.GenerateRefreshToken();
        var refreshTokenHash = _jwtService.HashToken(refreshTokenValue);
        var expiryDays = _configuration.GetValue<int>("Jwt:RefreshTokenExpiryDays");

        await _refreshTokenRepository.CreateAsync(new RefreshToken
        {
            UserId = userId,
            TokenHash = refreshTokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
            CreatedByIp = ipAddress
        });

        return refreshTokenValue;
    }

    private static string GetRoleName(int roleId)
    {
        return roleId switch
        {
            1 => "Student",
            2 => "Faculty",
            3 => "Librarian",
            4 => "Admin",
            _ => throw new InvalidOperationException($"Unknown role ID: {roleId}.")
        };
    }
}