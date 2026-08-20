using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class SettingRepository : ISettingRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public SettingRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Setting>> GetAllAsync()
    {
        const string sql = @"
            SELECT Id, `Key`, `Value`, Description, UpdatedAt, UpdatedByUserId
            FROM settings
            ORDER BY `Key`;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Setting>(sql);
    }

    public async Task<Setting?> GetAsync(string key)
    {
        const string sql = @"
            SELECT Id, `Key`, `Value`, Description, UpdatedAt, UpdatedByUserId
            FROM settings
            WHERE `Key` = @Key
            LIMIT 1;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Setting>(sql, new { Key = key });
    }

    public async Task UpsertAsync(Setting setting)
    {
        const string sql = @"
            INSERT INTO settings (`Key`, `Value`, Description, UpdatedByUserId)
            VALUES (@Key, @Value, @Description, @UpdatedByUserId)
            ON DUPLICATE KEY UPDATE
                `Value` = VALUES(`Value`),
                Description = VALUES(Description),
                UpdatedByUserId = VALUES(UpdatedByUserId);";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, setting);
    }

    public async Task<bool> DeleteAsync(string key)
    {
        const string sql = "DELETE FROM settings WHERE `Key` = @Key;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Key = key });
        return rows > 0;
    }
}