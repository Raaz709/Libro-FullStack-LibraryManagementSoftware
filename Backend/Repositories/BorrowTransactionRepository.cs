using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class BorrowTransactionRepository : IBorrowTransactionRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public BorrowTransactionRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<BorrowTransaction>> GetAllAsync()
    {
        const string sql = @"
            SELECT Id, UserId, ProcessedByUserId, BorrowedAt, Notes, CreatedAt
            FROM borrowtransactions
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<BorrowTransaction>(sql);
    }

    public async Task<BorrowTransaction?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, UserId, ProcessedByUserId, BorrowedAt, Notes, CreatedAt
            FROM borrowtransactions
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<BorrowTransaction>(sql, new { Id = id });
    }

    public async Task<IEnumerable<BorrowTransaction>> GetByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT Id, UserId, ProcessedByUserId, BorrowedAt, Notes, CreatedAt
            FROM borrowtransactions
            WHERE UserId = @UserId
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<BorrowTransaction>(sql, new { UserId = userId });
    }

    public async Task<int> CreateAsync(BorrowTransaction transaction)
    {
        const string sql = @"
            INSERT INTO borrowtransactions (UserId, ProcessedByUserId, BorrowedAt, Notes, CreatedAt)
            VALUES (@UserId, @ProcessedByUserId, COALESCE(@BorrowedAt, NOW()), @Notes, NOW());
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, transaction);
    }

    public async Task<bool> UpdateAsync(BorrowTransaction transaction)
    {
        const string sql = @"
            UPDATE borrowtransactions
            SET UserId = @UserId,
                ProcessedByUserId = @ProcessedByUserId,
                Notes = @Notes
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, transaction);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM borrowtransactions WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}