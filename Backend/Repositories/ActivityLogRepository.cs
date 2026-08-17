using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class ActivityLogRepository : IActivityLogRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ActivityLogRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<ActivityLog>> GetAllAsync()
    {
        const string sql = @"
            SELECT Id, UserId, Action, Details, IpAddress, UserAgent, CreatedAt
            FROM activitylogs
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ActivityLog>(sql);
    }

    public async Task<ActivityLog?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, UserId, Action, Details, IpAddress, UserAgent, CreatedAt
            FROM activitylogs
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<ActivityLog>(sql, new { Id = id });
    }

    public async Task<IEnumerable<ActivityLog>> GetByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT Id, UserId, Action, Details, IpAddress, UserAgent, CreatedAt
            FROM activitylogs
            WHERE UserId = @UserId
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ActivityLog>(sql, new { UserId = userId });
    }

    public async Task<int> CreateAsync(ActivityLog log)
    {
        const string sql = @"
            INSERT INTO activitylogs (UserId, Action, Details, IpAddress, UserAgent, CreatedAt)
            VALUES (@UserId, @Action, @Details, @IpAddress, @UserAgent, NOW());
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, log);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM activitylogs WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}