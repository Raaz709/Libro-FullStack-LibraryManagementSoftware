using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Library_Management.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Library_Management.Tests;

public class JwtServiceTests
{
    private static IConfiguration BuildConfig(string? key = null)
    {
        var values = new Dictionary<string, string?>
        {
            ["Jwt:Issuer"] = "LibraryManagementTest",
            ["Jwt:Audience"] = "LibraryManagementTestClients",
            ["Jwt:ExpiryMinutes"] = "30"
        };
        if (key is not null)
            values["Jwt:Key"] = key;
        return new ConfigurationBuilder().AddInMemoryCollection(values).Build();
    }

    [Fact]
    public void GenerateToken_ProducesJwt_WithExpectedClaims()
    {
        var service = new JwtService(
            BuildConfig("this-is-a-very-long-test-secret-key-that-is-at-least-32-bytes-long"));

        var token = service.GenerateToken(42, "user@test.com", "Student");

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);
        Assert.Equal("LibraryManagementTest", jwt.Issuer);
        Assert.Equal("LibraryManagementTestClients", jwt.Audiences.Single());
        Assert.Equal("42", jwt.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
        Assert.Equal("user@test.com", jwt.Claims.First(c => c.Type == ClaimTypes.Email).Value);
        Assert.Equal("Student", jwt.Claims.First(c => c.Type == ClaimTypes.Role).Value);
    }

    [Fact]
    public void GenerateToken_MissingKey_Throws()
    {
        var service = new JwtService(BuildConfig(null));
        Assert.Throws<InvalidOperationException>(() =>
            service.GenerateToken(1, "a@b.com", "Student"));
    }

    [Fact]
    public void GenerateRefreshToken_ReturnsNonEmptyBase64()
    {
        var service = new JwtService(BuildConfig());
        var token = service.GenerateRefreshToken();
        Assert.False(string.IsNullOrEmpty(token));
        Convert.FromBase64String(token);
    }

    [Fact]
    public void HashToken_IsDeterministicSha256()
    {
        var service = new JwtService(BuildConfig());
        var hash1 = service.HashToken("same-token-value");
        var hash2 = service.HashToken("same-token-value");
        Assert.Equal(hash1, hash2);
        Assert.NotEqual(hash1, service.HashToken("different-token-value"));
    }
}