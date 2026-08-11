using System.Data;
using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class PublisherRepository : IPublisherRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PublisherRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Publisher>> GetAllAsync()
    {
        const string sql = "SELECT * FROM publishers ORDER BY Name;";
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Publisher>(sql);
    }

    public async Task<Publisher?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM publishers WHERE Id = @Id;";
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Publisher>(sql, new { Id = id });
    }

    public async Task<int> CreateAsync(Publisher publisher)
    {
        const string sql = @"
            INSERT INTO publishers (Name, Website, Email, Phone, Address, CreatedAt, UpdatedAt)
            VALUES (@Name, @Website, @Email, @Phone, @Address, NOW(), NOW());
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, publisher);
    }

    public async Task<bool> UpdateAsync(Publisher publisher)
    {
        const string sql = @"
            UPDATE publishers
            SET Name = @Name,
                Website = @Website,
                Email = @Email,
                Phone = @Phone,
                Address = @Address,
                UpdatedAt = NOW()
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, publisher);
        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM publishers WHERE Id = @Id;";
        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }
}