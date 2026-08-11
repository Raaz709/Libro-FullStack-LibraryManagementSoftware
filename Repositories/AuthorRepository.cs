using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class AuthorRepository : IAuthorRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AuthorRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Author>> GetAllAsync()
    {
        const string sql = "SELECT * FROM authors ORDER BY LastName, FirstName;";
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Author>(sql);
    }

    public async Task<Author?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM authors WHERE Id = @Id;";
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Author>(sql, new { Id = id });
    }

    public async Task<int> CreateAsync(Author author)
    {
        const string sql = @"
            INSERT INTO authors (FirstName, LastName, Biography, Country, BirthDate, PhotoUrl, CreatedAt, UpdatedAt)
            VALUES (@FirstName, @LastName, @Biography, @Country, @BirthDate, @PhotoUrl, NOW(), NOW());
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, author);
    }

    public async Task<bool> UpdateAsync(Author author)
    {
        const string sql = @"
            UPDATE authors
            SET FirstName = @FirstName,
                LastName = @LastName,
                Biography = @Biography,
                Country = @Country,
                BirthDate = @BirthDate,
                PhotoUrl = @PhotoUrl,
                UpdatedAt = NOW()
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, author);
        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM authors WHERE Id = @Id;";
        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }
}