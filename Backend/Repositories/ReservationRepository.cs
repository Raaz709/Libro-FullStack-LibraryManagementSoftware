using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ReservationRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Reservation>> GetByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT r.Id, r.UserId, r.BookId, r.Status, r.ReservedAt, r.ExpiresAt, r.FulfilledAt, r.CancelledAt,
                   b.Title AS BookTitle
            FROM reservations r
            INNER JOIN books b ON b.Id = r.BookId
            WHERE r.UserId = @UserId
            ORDER BY r.ReservedAt DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Reservation>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<Reservation>> GetAllAsync()
    {
        const string sql = @"
            SELECT r.Id, r.UserId, r.BookId, r.Status, r.ReservedAt, r.ExpiresAt, r.FulfilledAt, r.CancelledAt,
                   b.Title AS BookTitle,
                   u.FirstName, u.LastName
            FROM reservations r
            INNER JOIN books b ON b.Id = r.BookId
            INNER JOIN users u ON u.Id = r.UserId
            ORDER BY
                CASE r.Status WHEN 'Waiting' THEN 0 ELSE 1 END,
                r.ReservedAt DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Reservation>(sql);
    }

    public async Task<Reservation?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, UserId, BookId, Status, ReservedAt, ExpiresAt, FulfilledAt, CancelledAt
            FROM reservations
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Reservation>(sql, new { Id = id });
    }

    public async Task<Reservation?> GetActiveByUserBookAsync(int userId, int bookId)
    {
        const string sql = @"
            SELECT Id, UserId, BookId, Status, ReservedAt, ExpiresAt, FulfilledAt, CancelledAt
            FROM reservations
            WHERE UserId = @UserId AND BookId = @BookId AND Status = 'Waiting'
            ORDER BY ReservedAt DESC
            LIMIT 1;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Reservation>(
            sql,
            new { UserId = userId, BookId = bookId });
    }

    public async Task<bool> HasAvailableCopiesAsync(int bookId)
    {
        const string sql = @"
            SELECT COUNT(1)
            FROM bookcopies
            WHERE BookId = @BookId AND Status = 'Available';";

        using var connection = _connectionFactory.CreateConnection();
        var count = await connection.ExecuteScalarAsync<int>(sql, new { BookId = bookId });
        return count > 0;
    }

    public async Task<int> CreateAsync(Reservation reservation)
    {
        const string sql = @"
            INSERT INTO reservations (UserId, BookId, Status, ReservedAt, ExpiresAt)
            VALUES (@UserId, @BookId, @Status, NOW(), @ExpiresAt);
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, reservation);
    }

    public async Task<bool> FulfillAsync(int id)
    {
        const string sql = @"
            UPDATE reservations
            SET Status = 'Fulfilled',
                FulfilledAt = NOW()
            WHERE Id = @Id AND Status = 'Waiting';";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }

    public async Task<bool> CancelAsync(int id)
    {
        const string sql = @"
            UPDATE reservations
            SET Status = 'Cancelled',
                CancelledAt = NOW()
            WHERE Id = @Id AND Status = 'Waiting';";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM reservations WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}