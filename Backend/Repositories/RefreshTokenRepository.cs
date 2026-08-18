using Dapper;
using Library_Management.Data;
using Library_Management.Models;
using Library_Management.Repositories.Interface;

namespace Library_Management.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public RefreshTokenRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<int> CreateAsync(RefreshToken refreshToken)
    {
        const string sql = @"
            INSERT INTO RefreshTokens (
                UserId,
                TokenHash,
                ExpiresAt,
                CreatedAt,
                CreatedByIp
            )
            VALUES (
                @UserId,
                @TokenHash,
                @ExpiresAt,
                NOW(),
                @CreatedByIp
            );
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, refreshToken);
    }

    public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash)
    {
        const string sql = @"
            SELECT
                Id,
                UserId,
                TokenHash,
                ExpiresAt,
                CreatedAt,
                RevokedAt,
                ReplacedByTokenId,
                CreatedByIp,
                RevokedByIp
            FROM RefreshTokens
            WHERE TokenHash = @TokenHash;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<RefreshToken>(sql, new { TokenHash = tokenHash });
    }

    public async Task<bool> RevokeAsync(int id, string? revokedByIp = null, int? replacedByTokenId = null)
    {
        const string sql = @"
            UPDATE RefreshTokens
            SET RevokedAt = NOW(),
                RevokedByIp = @RevokedByIp,
                ReplacedByTokenId = @ReplacedByTokenId
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new
        {
            Id = id,
            RevokedByIp = revokedByIp,
            ReplacedByTokenId = replacedByTokenId
        });
        return rowsAffected > 0;
    }

    public async Task<bool> RevokeAllForUserAsync(int userId, string? revokedByIp = null)
    {
        const string sql = @"
            UPDATE RefreshTokens
            SET RevokedAt = NOW(),
                RevokedByIp = @RevokedByIp
            WHERE UserId = @UserId AND RevokedAt IS NULL;";

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new { UserId = userId, RevokedByIp = revokedByIp });
        return rowsAffected > 0;
    }
}