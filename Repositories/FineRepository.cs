using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class FineRepository : IFineRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public FineRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Fine>> GetAllAsync()
    {
        const string sql = @"
            SELECT Id, UserId, BorrowItemId, Type, Amount, Reason, Status, CreatedAt, WaivedAt, WaivedByUserId
            FROM fines
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Fine>(sql);
    }

    public async Task<Fine?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, UserId, BorrowItemId, Type, Amount, Reason, Status, CreatedAt, WaivedAt, WaivedByUserId
            FROM fines
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Fine>(sql, new { Id = id });
    }

    public async Task<IEnumerable<Fine>> GetByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT Id, UserId, BorrowItemId, Type, Amount, Reason, Status, CreatedAt, WaivedAt, WaivedByUserId
            FROM fines
            WHERE UserId = @UserId
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Fine>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<Fine>> GetUnpaidByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT Id, UserId, BorrowItemId, Type, Amount, Reason, Status, CreatedAt, WaivedAt, WaivedByUserId
            FROM fines
            WHERE UserId = @UserId AND Status = 'Unpaid'
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Fine>(sql, new { UserId = userId });
    }

    public async Task<int> CreateAsync(Fine fine)
    {
        const string sql = @"
            INSERT INTO fines (UserId, BorrowItemId, Type, Amount, Reason, Status, CreatedAt)
            VALUES (@UserId, @BorrowItemId, @Type, @Amount, @Reason, @Status, NOW());
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, fine);
    }

    public async Task<bool> UpdateAsync(Fine fine)
    {
        const string sql = @"
            UPDATE fines
            SET Type = @Type,
                Amount = @Amount,
                Reason = @Reason,
                Status = @Status
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, fine);
        return rows > 0;
    }

    public async Task<bool> WaiveFineAsync(int id, int waivedByUserId)
    {
        const string sql = @"
            UPDATE fines
            SET Status = 'Waived',
                WaivedAt = NOW(),
                WaivedByUserId = @WaivedByUserId
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id, WaivedByUserId = waivedByUserId });
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM fines WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}