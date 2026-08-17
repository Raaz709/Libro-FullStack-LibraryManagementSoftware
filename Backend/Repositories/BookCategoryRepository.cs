using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class BookCategoryRepository : IBookCategoryRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public BookCategoryRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Category>> GetCategoriesByBookIdAsync(int bookId)
    {
        const string sql = @"
            SELECT c.Id, c.ParentCategoryId, c.Name, c.Description, c.Icon, c.CreatedAt, c.UpdatedAt
            FROM categories c
            INNER JOIN bookcategories bc ON c.Id = bc.CategoryId
            WHERE bc.BookId = @BookId;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Category>(sql, new { BookId = bookId });
    }

    public async Task<IEnumerable<Book>> GetBooksByCategoryIdAsync(int categoryId)
    {
        const string sql = @"
            SELECT b.Id, b.ISBN, b.Title, b.Subtitle, b.Description, b.Language, b.Edition, b.PublisherId, b.PublishedDate, b.Price, b.CoverImageUrl, b.Status, b.CreatedAt, b.UpdatedAt
            FROM books b
            INNER JOIN bookcategories bc ON b.Id = bc.BookId
            WHERE bc.CategoryId = @CategoryId AND b.DeletedAt IS NULL;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Book>(sql, new { CategoryId = categoryId });
    }

    public async Task<bool> AssignCategoryAsync(int bookId, int categoryId)
    {
        const string sql = @"
            INSERT IGNORE INTO bookcategories (BookId, CategoryId)
            VALUES (@BookId, @CategoryId);";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { BookId = bookId, CategoryId = categoryId });
        return rows > 0;
    }

    public async Task<bool> RemoveCategoryAsync(int bookId, int categoryId)
    {
        const string sql = @"
            DELETE FROM bookcategories
            WHERE BookId = @BookId AND CategoryId = @CategoryId;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { BookId = bookId, CategoryId = categoryId });
        return rows > 0;
    }
}