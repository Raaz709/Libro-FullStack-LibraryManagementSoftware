using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ReviewRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Review>> GetByBookIdAsync(int bookId)
    {
        const string sql = @"
            SELECT r.Id, r.UserId, r.BookId, r.Rating, r.Comment, r.Status, r.CreatedAt, r.UpdatedAt,
                   u.FirstName, u.LastName
            FROM reviews r
            INNER JOIN users u ON u.Id = r.UserId
            WHERE r.BookId = @BookId AND r.Status = 'Published'
            ORDER BY r.CreatedAt DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Review>(sql, new { BookId = bookId });
    }

    public async Task<Review?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, UserId, BookId, Rating, Comment, Status, CreatedAt, UpdatedAt
            FROM reviews
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Review>(sql, new { Id = id });
    }

    public async Task<Review?> GetByUserBookAsync(int userId, int bookId)
    {
        const string sql = @"
            SELECT Id, UserId, BookId, Rating, Comment, Status, CreatedAt, UpdatedAt
            FROM reviews
            WHERE UserId = @UserId AND BookId = @BookId;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Review>(
            sql,
            new { UserId = userId, BookId = bookId });
    }

    public async Task<ReviewSummary?> GetSummaryAsync(int bookId)
    {
        const string sql = @"
            SELECT COALESCE(AVG(Rating), 0) AS AverageRating, COUNT(1) AS Count
            FROM reviews
            WHERE BookId = @BookId AND Status = 'Published';";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<ReviewSummary>(
            sql,
            new { BookId = bookId });
    }

    public async Task<int> CreateAsync(Review review)
    {
        const string sql = @"
            INSERT INTO reviews (UserId, BookId, Rating, Comment, Status, CreatedAt, UpdatedAt)
            VALUES (@UserId, @BookId, @Rating, @Comment, @Status, NOW(), NOW());
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, review);
    }

    public async Task<bool> UpdateAsync(Review review)
    {
        const string sql = @"
            UPDATE reviews
            SET Rating = @Rating,
                Comment = @Comment,
                UpdatedAt = NOW()
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, review);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM reviews WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}