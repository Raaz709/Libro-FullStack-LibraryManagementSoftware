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
    private readonly IJwtService _jwtService;

    public AuthService(
        IUserRepository userRepository,
        IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash))
        {
            return null;
        }

        if (user.Status != "Active")
        {
            return null;
        }

        var roleName = GetRoleName(user.RoleId);

        var token = _jwtService.GenerateToken(
            user.Id,
            user.Email,
            roleName);

        return new LoginResponseDto
        {
            Token = token,
            UserId = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            RoleId = user.RoleId
        };
    }

    public async Task<int> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser =
            await _userRepository.GetByEmailAsync(request.Email);

        if (existingUser != null)
        {
            throw new InvalidOperationException(
                "A user with this email already exists.");
        }

        var passwordHash =
            BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            RoleId = 1,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            PasswordHash = passwordHash,
            Status = "Active",
            MembershipNumber = string.Empty
        };

        return await _userRepository.CreateAsync(user);
    }

    private static string GetRoleName(int roleId)
    {
        return roleId switch
        {
            1 => "Student",
            2 => "Faculty",
            3 => "Librarian",
            4 => "Admin",
            _ => throw new InvalidOperationException(
                $"Unknown role ID: {roleId}.")
        };
    }
}