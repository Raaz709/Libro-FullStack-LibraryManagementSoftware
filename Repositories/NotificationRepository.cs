using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public NotificationRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Notification>> GetAllAsync()
    {
        const string sql = @"
            SELECT Id, UserId, Title, Message, Type, IsRead, CreatedAt
            FROM notifications
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Notification>(sql);
    }

    public async Task<Notification?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, UserId, Title, Message, Type, IsRead, CreatedAt
            FROM notifications
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Notification>(sql, new { Id = id });
    }

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT Id, UserId, Title, Message, Type, IsRead, CreatedAt
            FROM notifications
            WHERE UserId = @UserId
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Notification>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT Id, UserId, Title, Message, Type, IsRead, CreatedAt
            FROM notifications
            WHERE UserId = @UserId AND IsRead = 0
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Notification>(sql, new { UserId = userId });
    }

    public async Task<int> CreateAsync(Notification notification)
    {
        const string sql = @"
            INSERT INTO notifications (UserId, Title, Message, Type, IsRead, CreatedAt)
            VALUES (@UserId, @Title, @Message, @Type, 0, NOW());
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, notification);
    }

    public async Task<bool> MarkAsReadAsync(int id)
    {
        const string sql = @"
            UPDATE notifications
            SET IsRead = 1
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }

    public async Task<bool> MarkAllAsReadByUserIdAsync(int userId)
    {
        const string sql = @"
            UPDATE notifications
            SET IsRead = 1
            WHERE UserId = @UserId AND IsRead = 0;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { UserId = userId });
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM notifications WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}