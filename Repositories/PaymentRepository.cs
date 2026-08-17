using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PaymentRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Payment>> GetAllAsync()
    {
        const string sql = @"
            SELECT Id, FineId, UserId, Amount, PaymentMethod, TransactionReference, PaidAt, ProcessedByUserId
            FROM payments
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Payment>(sql);
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, FineId, UserId, Amount, PaymentMethod, TransactionReference, PaidAt, ProcessedByUserId
            FROM payments
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Payment>(sql, new { Id = id });
    }

    public async Task<IEnumerable<Payment>> GetByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT Id, FineId, UserId, Amount, PaymentMethod, TransactionReference, PaidAt, ProcessedByUserId
            FROM payments
            WHERE UserId = @UserId
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Payment>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<Payment>> GetByFineIdAsync(int fineId)
    {
        const string sql = @"
            SELECT Id, FineId, UserId, Amount, PaymentMethod, TransactionReference, PaidAt, ProcessedByUserId
            FROM payments
            WHERE FineId = @FineId
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Payment>(sql, new { FineId = fineId });
    }

    public async Task<int> CreateAsync(Payment payment)
    {
        const string insertSql = @"
        INSERT INTO payments
            (FineId, UserId, Amount, PaymentMethod, TransactionReference, PaidAt, ProcessedByUserId)
        VALUES
            (@FineId, @UserId, @Amount, @PaymentMethod, @TransactionReference, NOW(), @ProcessedByUserId);

        SELECT LAST_INSERT_ID();";

        const string updateFineSql = @"
        UPDATE fines
        SET Status = 'Paid'
        WHERE Id = @FineId
          AND Status = 'Unpaid'
          AND Amount = @Amount;";

        using var connection = _connectionFactory.CreateConnection();
        connection.Open();

        using var transaction = connection.BeginTransaction();

        try
        {
            var fineUpdated = await connection.ExecuteAsync(
                updateFineSql,
                payment,
                transaction
            );

            if (fineUpdated != 1)
            {
                transaction.Rollback();
                return 0;
            }

            var paymentId = await connection.ExecuteScalarAsync<int>(
                insertSql,
                payment,
                transaction
            );

            transaction.Commit();

            return paymentId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM payments WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}