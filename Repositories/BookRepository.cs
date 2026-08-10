using Dapper;
using Library_Management.Data;
using Library_Management.Models;
using Library_Management.Repositories.Interfaces;

namespace Library_Management.Repositories;

public class BookRepository : IBookRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public BookRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Book>> GetAllAsync()
    {
        const string sql = """
            SELECT
                Id,
                ISBN,
                Title,
                Subtitle,
                Description,
                Language,
                Edition,
                PublisherId,
                PublishedDate,
                Price,
                CoverImageUrl,
                Status,
                CreatedAt
            FROM Books
            ORDER BY Id DESC;
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<Book>(sql);
    }

    public async Task<Book?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                Id,
                ISBN,
                Title,
                Subtitle,
                Description,
                Language,
                Edition,
                PublisherId,
                PublishedDate,
                Price,
                CoverImageUrl,
                Status,
                CreatedAt
            FROM Books
            WHERE Id = @Id;
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Book>(
            sql,
            new { Id = id });
    }

    public async Task<int> CreateAsync(Book book)
    {
        const string sql = """
            INSERT INTO Books
            (
                ISBN,
                Title,
                Subtitle,
                Description,
                Language,
                Edition,
                PublisherId,
                PublishedDate,
                Price,
                CoverImageUrl,
                Status,
                CreatedAt
            )
            VALUES
            (
                @ISBN,
                @Title,
                @Subtitle,
                @Description,
                @Language,
                @Edition,
                @PublisherId,
                @PublishedDate,
                @Price,
                @CoverImageUrl,
                @Status,
                @CreatedAt
            );

            SELECT LAST_INSERT_ID();
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(sql, book);
    }

    public async Task<bool> UpdateAsync(Book book)
    {
        const string sql = """
            UPDATE Books
            SET
                ISBN = @ISBN,
                Title = @Title,
                Subtitle = @Subtitle,
                Description = @Description,
                Language = @Language,
                Edition = @Edition,
                PublisherId = @PublisherId,
                PublishedDate = @PublishedDate,
                Price = @Price,
                CoverImageUrl = @CoverImageUrl,
                Status = @Status
            WHERE Id = @Id;
            """;

        using var connection = _connectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(sql, book);

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM Books
            WHERE Id = @Id;
            """;

        using var connection = _connectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new { Id = id });

        return rowsAffected > 0;
    }
}