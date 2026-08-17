using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AuditLogRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<AuditLog>> GetAllAsync()
    {
        const string sql = @"
            SELECT Id, UserId, Action, EntityType, EntityId, OldValues, NewValues, IpAddress, UserAgent, CreatedAt
            FROM auditlogs
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<AuditLog>(sql);
    }

    public async Task<AuditLog?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, UserId, Action, EntityType, EntityId, OldValues, NewValues, IpAddress, UserAgent, CreatedAt
            FROM auditlogs
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<AuditLog>(sql, new { Id = id });
    }

    public async Task<IEnumerable<AuditLog>> GetByEntityTypeAsync(string entityType, int entityId)
    {
        const string sql = @"
            SELECT Id, UserId, Action, EntityType, EntityId, OldValues, NewValues, IpAddress, UserAgent, CreatedAt
            FROM auditlogs
            WHERE EntityType = @EntityType AND EntityId = @EntityId
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<AuditLog>(sql, new { EntityType = entityType, EntityId = entityId });
    }

    public async Task<IEnumerable<AuditLog>> GetByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT Id, UserId, Action, EntityType, EntityId, OldValues, NewValues, IpAddress, UserAgent, CreatedAt
            FROM auditlogs
            WHERE UserId = @UserId
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<AuditLog>(sql, new { UserId = userId });
    }

    public async Task<int> CreateAsync(AuditLog log)
    {
        const string sql = @"
            INSERT INTO auditlogs (UserId, Action, EntityType, EntityId, OldValues, NewValues, IpAddress, UserAgent, CreatedAt)
            VALUES (@UserId, @Action, @EntityType, @EntityId, @OldValues, @NewValues, @IpAddress, @UserAgent, NOW());
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, log);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM auditlogs WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}