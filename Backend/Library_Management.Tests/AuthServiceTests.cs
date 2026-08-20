using Library_Management.DTOs.User.Auth;
using Library_Management.Models;
using Library_Management.Repositories;
using Library_Management.Repositories.Interface;
using Library_Management.Services;
using Library_Management.Services.Interface;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace Library_Management.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IRefreshTokenRepository> _refreshRepo = new();
    private readonly Mock<IJwtService> _jwtService = new();
    private readonly IConfiguration _config = BuildConfig();

    private AuthService CreateService() =>
        new(_userRepo.Object, _refreshRepo.Object, _jwtService.Object, _config);

    private static IConfiguration BuildConfig()
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Registration:FacultyPassword"] = "faculty-secret",
                ["Jwt:RefreshTokenExpiryDays"] = "7"
            })
            .Build();
    }

    private static User ActiveUser(int id = 12) => new()
    {
        Id = id,
        RoleId = 1,
        FirstName = "Jane",
        LastName = "Doe",
        Email = "jane@test.com",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
        Status = "Active",
        MembershipNumber = "LBM-123"
    };

    [Fact]
    public async Task RegisterAsync_Student_Succeeds()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("new@test.com"))
            .ReturnsAsync((User?)null);
        _userRepo.Setup(r => r.CreateAsync(It.IsAny<User>()))
            .ReturnsAsync(42);

        var id = await CreateService().RegisterAsync(new RegisterRequestDto
        {
            FirstName = "A",
            LastName = "B",
            Email = "new@test.com",
            Password = "Pass@123",
            RoleId = 1
        });

        Assert.Equal(42, id);
        _userRepo.Verify(r => r.CreateAsync(It.Is<User>(u =>
            u.RoleId == 1 &&
            u.Status == "Active" &&
            !string.IsNullOrEmpty(u.PasswordHash) &&
            u.PasswordHash != "Pass@123" &&
            u.MembershipNumber.StartsWith("LBM-"))), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_Throws()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("jane@test.com"))
            .ReturnsAsync(ActiveUser());

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            CreateService().RegisterAsync(new RegisterRequestDto
            {
                Email = "jane@test.com",
                Password = "Pass@123",
                RoleId = 1
            }));

        _userRepo.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task RegisterAsync_LibrarianRole_Throws()
    {
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            CreateService().RegisterAsync(new RegisterRequestDto
            {
                Email = "librarian@test.com",
                Password = "Pass@123",
                RoleId = 3
            }));
    }

    [Theory]
    [InlineData("wrong-secret", false)]
    [InlineData("faculty-secret", true)]
    public async Task RegisterAsync_FacultyPassword_Validated(string password, bool shouldSucceed)
    {
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((User?)null);
        _userRepo.Setup(r => r.CreateAsync(It.IsAny<User>())).ReturnsAsync(1);

        var request = new RegisterRequestDto
        {
            Email = "prof@test.com",
            Password = "Pass@123",
            RoleId = 2,
            FacultyPassword = password
        };

        if (shouldSucceed)
        {
            var id = await CreateService().RegisterAsync(request);
            Assert.Equal(1, id);
            _userRepo.Verify(r => r.CreateAsync(It.Is<User>(u => u.RoleId == 2)), Times.Once);
        }
        else
        {
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                CreateService().RegisterAsync(request));
            _userRepo.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Never);
        }
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokens()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("jane@test.com"))
            .ReturnsAsync(ActiveUser());
        _jwtService.Setup(j => j.GenerateToken(12, "jane@test.com", "Student"))
            .Returns("access-token");
        _jwtService.Setup(j => j.GenerateRefreshToken()).Returns("refresh-token");
        _jwtService.Setup(j => j.HashToken(It.IsAny<string>())).Returns("hash");
        _refreshRepo.Setup(r => r.CreateAsync(It.IsAny<RefreshToken>())).ReturnsAsync(1);

        var result = await CreateService().LoginAsync(
            new LoginRequestDto { Email = "jane@test.com", Password = "Pass@123" },
            "127.0.0.1");

        Assert.NotNull(result);
        Assert.Equal("access-token", result.Token);
        Assert.Equal("refresh-token", result.RefreshToken);
        Assert.Equal(12, result.UserId);
        Assert.Equal(1, result.RoleId);
        _refreshRepo.Verify(r => r.CreateAsync(It.Is<RefreshToken>(t =>
            t.UserId == 12 && t.TokenHash == "hash")), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ReturnsNull()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("jane@test.com"))
            .ReturnsAsync(ActiveUser());

        var result = await CreateService().LoginAsync(
            new LoginRequestDto { Email = "jane@test.com", Password = "wrong" },
            null);

        Assert.Null(result);
        _refreshRepo.Verify(r => r.CreateAsync(It.IsAny<RefreshToken>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_InactiveUser_ReturnsNull()
    {
        var user = ActiveUser();
        user.Status = "Inactive";
        _userRepo.Setup(r => r.GetByEmailAsync("jane@test.com")).ReturnsAsync(user);

        var result = await CreateService().LoginAsync(
            new LoginRequestDto { Email = "jane@test.com", Password = "Pass@123" },
            null);

        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_UnknownEmail_ReturnsNull()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("nobody@test.com"))
            .ReturnsAsync((User?)null);

        var result = await CreateService().LoginAsync(
            new LoginRequestDto { Email = "nobody@test.com", Password = "x" },
            null);

        Assert.Null(result);
    }

    [Fact]
    public async Task RefreshTokenAsync_Valid_RotatesAndRevokes()
    {
        var existing = new RefreshToken
        {
            Id = 9,
            UserId = 12,
            TokenHash = "old-hash",
            ExpiresAt = DateTime.UtcNow.AddDays(1)
        };
        _refreshRepo.Setup(r => r.GetByTokenHashAsync("old-hash")).ReturnsAsync(existing);
        _userRepo.Setup(r => r.GetByIdAsync(12)).ReturnsAsync(ActiveUser());
        _jwtService.Setup(j => j.HashToken("old-token")).Returns("old-hash");
        _jwtService.Setup(j => j.HashToken("new-token")).Returns("new-hash");
        _jwtService.Setup(j => j.GenerateRefreshToken()).Returns("new-token");
        _jwtService.Setup(j => j.GenerateToken(12, "jane@test.com", "Student"))
            .Returns("new-access");
        _refreshRepo.Setup(r => r.CreateAsync(It.IsAny<RefreshToken>())).ReturnsAsync(21);

        var result = await CreateService().RefreshTokenAsync("old-token", "10.0.0.1");

        Assert.NotNull(result);
        Assert.Equal("new-access", result.AccessToken);
        Assert.Equal("new-token", result.RefreshToken);
        _refreshRepo.Verify(r => r.CreateAsync(It.Is<RefreshToken>(t =>
            t.UserId == 12 && t.TokenHash == "new-hash")), Times.Once);
        _refreshRepo.Verify(r => r.RevokeAsync(9, "10.0.0.1", 21), Times.Once);
    }

    [Fact]
    public async Task RefreshTokenAsync_Revoked_ReturnsNull()
    {
        var existing = new RefreshToken
        {
            Id = 9,
            UserId = 12,
            RevokedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(1)
        };
        _refreshRepo.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>())).ReturnsAsync(existing);

        var result = await CreateService().RefreshTokenAsync("old-token", null);
        Assert.Null(result);
    }

    [Fact]
    public async Task RefreshTokenAsync_InactiveUser_ReturnsNull()
    {
        var existing = new RefreshToken
        {
            Id = 9,
            UserId = 12,
            ExpiresAt = DateTime.UtcNow.AddDays(1)
        };
        var user = ActiveUser();
        user.Status = "Inactive";
        _refreshRepo.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>())).ReturnsAsync(existing);
        _userRepo.Setup(r => r.GetByIdAsync(12)).ReturnsAsync(user);

        var result = await CreateService().RefreshTokenAsync("old-token", null);
        Assert.Null(result);
    }

    [Fact]
    public async Task LogoutAsync_ActiveToken_Revokes()
    {
        var existing = new RefreshToken
        {
            Id = 9,
            UserId = 12,
            ExpiresAt = DateTime.UtcNow.AddDays(1)
        };
        _refreshRepo.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>())).ReturnsAsync(existing);
        _refreshRepo.Setup(r => r.RevokeAsync(9, "1.2.3.4")).ReturnsAsync(true);
        _jwtService.Setup(j => j.HashToken("token")).Returns("hash");

        var result = await CreateService().LogoutAsync("token", "1.2.3.4");
        Assert.True(result);
    }

    [Fact]
    public async Task LogoutAsync_UnknownToken_ReturnsFalse()
    {
        _refreshRepo.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>()))
            .ReturnsAsync((RefreshToken?)null);
        _jwtService.Setup(j => j.HashToken("token")).Returns("hash");

        var result = await CreateService().LogoutAsync("token", null);
        Assert.False(result);
    }
}