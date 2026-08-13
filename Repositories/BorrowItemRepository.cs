using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class BorrowItemRepository : IBorrowItemRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public BorrowItemRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<BorrowItem>> GetAllAsync()
    {
        const string sql = @"
            SELECT Id, BorrowTransactionId, BookCopyId, BorrowedAt, DueDate, ReturnedAt, Status, RenewalCount, ConditionAtBorrow, ConditionAtReturn
            FROM borrowitems
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<BorrowItem>(sql);
    }

    public async Task<BorrowItem?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, BorrowTransactionId, BookCopyId, BorrowedAt, DueDate, ReturnedAt, Status, RenewalCount, ConditionAtBorrow, ConditionAtReturn
            FROM borrowitems
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<BorrowItem>(sql, new { Id = id });
    }

    public async Task<IEnumerable<BorrowItem>> GetByTransactionIdAsync(int transactionId)
    {
        const string sql = @"
            SELECT Id, BorrowTransactionId, BookCopyId, BorrowedAt, DueDate, ReturnedAt, Status, RenewalCount, ConditionAtBorrow, ConditionAtReturn
            FROM borrowitems
            WHERE BorrowTransactionId = @TransactionId;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<BorrowItem>(sql, new { TransactionId = transactionId });
    }

    public async Task<IEnumerable<BorrowItem>> GetOverdueItemsAsync()
    {
        const string sql = @"
            SELECT Id, BorrowTransactionId, BookCopyId, BorrowedAt, DueDate, ReturnedAt, Status, RenewalCount, ConditionAtBorrow, ConditionAtReturn
            FROM borrowitems
            WHERE Status = 'Borrowed' AND DueDate < NOW();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<BorrowItem>(sql);
    }

    public async Task<int> CreateAsync(BorrowItem item)
    {
        const string sql = @"
            INSERT INTO borrowitems (BorrowTransactionId, BookCopyId, BorrowedAt, DueDate, Status, RenewalCount, ConditionAtBorrow)
            VALUES (@BorrowTransactionId, @BookCopyId, COALESCE(@BorrowedAt, NOW()), @DueDate, @Status, @RenewalCount, @ConditionAtBorrow);
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, item);
    }

    public async Task<bool> UpdateAsync(BorrowItem item)
    {
        const string sql = @"
            UPDATE borrowitems
            SET DueDate = @DueDate,
                ReturnedAt = @ReturnedAt,
                Status = @Status,
                RenewalCount = @RenewalCount,
                ConditionAtBorrow = @ConditionAtBorrow,
                ConditionAtReturn = @ConditionAtReturn
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, item);
        return rows > 0;
    }

    public async Task<bool> ReturnItemAsync(int id, string? conditionAtReturn)
    {
        const string sql = @"
            UPDATE borrowitems
            SET ReturnedAt = NOW(),
                Status = 'Returned',
                ConditionAtReturn = @ConditionAtReturn
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id, ConditionAtReturn = conditionAtReturn });
        return rows > 0;
    }

    public async Task<bool> RenewItemAsync(int id, DateTime newDueDate)
    {
        const string sql = @"
            UPDATE borrowitems
            SET DueDate = @NewDueDate,
                RenewalCount = RenewalCount + 1
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id, NewDueDate = newDueDate });
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM borrowitems WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}