using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public FavoriteRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Book>> GetFavoritesByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT b.Id, b.ISBN, b.Title, b.Subtitle, b.Description, b.Language, b.Edition, b.PublisherId, b.PublishedDate, b.Price, b.CoverImageUrl, b.Status, b.CreatedAt, b.UpdatedAt
            FROM books b
            INNER JOIN favorites f ON b.Id = f.BookId
            WHERE f.UserId = @UserId AND b.DeletedAt IS NULL
            ORDER BY f.CreatedAt DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Book>(sql, new { UserId = userId });
    }

    public async Task<bool> IsFavoriteAsync(int userId, int bookId)
    {
        const string sql = @"
            SELECT COUNT(1)
            FROM favorites
            WHERE UserId = @UserId AND BookId = @BookId;";

        using var connection = _connectionFactory.CreateConnection();
        var count = await connection.ExecuteScalarAsync<int>(sql, new { UserId = userId, BookId = bookId });
        return count > 0;
    }

    public async Task<bool> AddFavoriteAsync(int userId, int bookId)
    {
        const string sql = @"
            INSERT IGNORE INTO favorites (UserId, BookId, CreatedAt)
            VALUES (@UserId, @BookId, NOW());";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { UserId = userId, BookId = bookId });
        return rows > 0;
    }

    public async Task<bool> RemoveFavoriteAsync(int userId, int bookId)
    {
        const string sql = @"
            DELETE FROM favorites
            WHERE UserId = @UserId AND BookId = @BookId;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { UserId = userId, BookId = bookId });
        return rows > 0;
    }
}