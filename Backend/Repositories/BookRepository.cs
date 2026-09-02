using Dapper;
using Library_Management.Data;
using Library_Management.Models;
using Library_Management.Repositories.Interface;

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
            FROM books
            ORDER BY Id DESC;
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<Book>(sql);
    }

    public async Task<PagedResult<Book>> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        string? status = null,
        string? language = null,
        int? categoryId = null,
        string? sort = null)
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1 || pageSize > 100)
        {
            pageSize = 20;
        }

        var conditions = new List<string>();
        var parameters = new DynamicParameters();
        parameters.Add("Offset", (page - 1) * pageSize);
        parameters.Add("PageSize", pageSize);

        if (!string.IsNullOrWhiteSpace(search))
        {
            conditions.Add("(Title LIKE @Search OR ISBN LIKE @Search)");
            parameters.Add("Search", $"%{search.Trim()}%");
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            conditions.Add("Status = @Status");
            parameters.Add("Status", status.Trim());
        }

        if (!string.IsNullOrWhiteSpace(language))
        {
            conditions.Add("Language = @Language");
            parameters.Add("Language", language.Trim());
        }

        if (categoryId is not null)
        {
            conditions.Add(@"EXISTS (
                SELECT 1 FROM bookcategories bc
                WHERE bc.BookId = books.Id AND bc.CategoryId = @CategoryId)");
            parameters.Add("CategoryId", categoryId.Value);
        }

        var whereClause = conditions.Count > 0 ? $" WHERE {string.Join(" AND ", conditions)}" : string.Empty;

        var orderBy = sort switch
        {
            "title" => "Title ASC",
            "price-low" => "Price ASC",
            "price-high" => "Price DESC",
            _ => "Id DESC"
        };

        var countSql = $"SELECT COUNT(1) FROM books{whereClause};";

        var itemsSql = $"""
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
            FROM books{whereClause}
            ORDER BY {orderBy}
            LIMIT @Offset, @PageSize;
            """;

        using var connection = _connectionFactory.CreateConnection();

        var total = await connection.ExecuteScalarAsync<int>(countSql, parameters);
        var items = await connection.QueryAsync<Book>(itemsSql, parameters);

        return new PagedResult<Book>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
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
            FROM books
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
            INSERT INTO books
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
            UPDATE books
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
            DELETE FROM books
            WHERE Id = @Id;
            """;

        using var connection = _connectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new { Id = id });

        return rowsAffected > 0;
    }
}