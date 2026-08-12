using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public CategoryRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        const string sql = "SELECT * FROM categories ORDER BY Name;";
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Category>(sql);
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM categories WHERE Id = @Id;";
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Category>(sql, new { Id = id });
    }

    public async Task<int> CreateAsync(Category category)
    {
        const string sql = @"
            INSERT INTO categories (Name, Description, CreatedAt, UpdatedAt)
            VALUES (@Name, @Description, NOW(), NOW());
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, category);
    }

    public async Task<bool> UpdateAsync(Category category)
    {
        const string sql = @"
            UPDATE categories
            SET Name = @Name,
                Description = @Description,
                UpdatedAt = NOW()
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, category);
        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM categories WHERE Id = @Id;";
        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }
}