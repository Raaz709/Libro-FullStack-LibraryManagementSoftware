using Library_Management.Models;

namespace Library_Management.Repositories.Interface;

public interface IRefreshTokenRepository
{
    Task<int> CreateAsync(RefreshToken refreshToken);
    Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
    Task<bool> RevokeAsync(int id, string? revokedByIp = null, int? replacedByTokenId = null);
    Task<bool> RevokeAllForUserAsync(int userId, string? revokedByIp = null);
}