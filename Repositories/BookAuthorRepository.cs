using Dapper;
using Library_Management.Data;
using Library_Management.Models;
using Library_Management.Repositories.Interface;

namespace Library_Management.Repositories;

public class BookAuthorRepository : IBookAuthorRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public BookAuthorRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Author>> GetAuthorsByBookIdAsync(int bookId)
    {
        const string sql = @"
            SELECT a.* 
            FROM authors a
            INNER JOIN bookauthors ba ON a.Id = ba.AuthorId
            WHERE ba.BookId = @BookId;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Author>(sql, new { BookId = bookId });
    }

    public async Task<bool> AddAuthorToBookAsync(int bookId, int authorId, bool isPrimary)
    {
        const string sql = @"
            INSERT INTO bookauthors (BookId, AuthorId, IsPrimary)
            VALUES (@BookId, @AuthorId, @IsPrimary)
            ON DUPLICATE KEY UPDATE IsPrimary = @IsPrimary;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { BookId = bookId, AuthorId = authorId, IsPrimary = isPrimary });
        return rows > 0;
    }

    public async Task<bool> RemoveAuthorFromBookAsync(int bookId, int authorId)
    {
        const string sql = "DELETE FROM bookauthors WHERE BookId = @BookId AND AuthorId = @AuthorId;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { BookId = bookId, AuthorId = authorId });
        return rows > 0;
    }
}