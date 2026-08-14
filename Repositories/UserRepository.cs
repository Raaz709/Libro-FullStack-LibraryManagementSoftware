using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        const string sql = @"
            SELECT 
                Id,
                FirstName,
                LastName,
                Email,
                Phone,
                Status,
                MembershipNumber,
                CreatedAt,
                UpdatedAt
            FROM users 
            ORDER BY LastName, FirstName;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<User>(sql);
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT 
                Id,
                FirstName,
                LastName,
                Email,
                Phone,
                Status,
                MembershipNumber,
                CreatedAt,
                UpdatedAt
            FROM users 
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = @"
        SELECT 
            Id,
            RoleId,
            FirstName,
            LastName,
            Email,
            Phone,
            PasswordHash,
            Status,
            MembershipNumber,
            CreatedAt,
            UpdatedAt
        FROM users 
        WHERE Email = @Email;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<int> CreateAsync(User member)
    {
        const string sql = @"
            INSERT INTO users (
                RoleId, 
                FirstName, 
                LastName, 
                Email, 
                Phone, 
                PasswordHash, 
                Status, 
                MembershipNumber, 
                CreatedAt, 
                UpdatedAt
            )
            VALUES (
                @RoleId, 
                @FirstName, 
                @LastName, 
                @Email, 
                @Phone, 
                @PasswordHash, 
                @Status, 
                @MembershipNumber, 
                NOW(), 
                NOW()
            );
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, member);
    }

    public async Task<bool> UpdateAsync(User member)
    {
        const string sql = @"
            UPDATE users
            SET FirstName = @FirstName,
                LastName = @LastName,
                Email = @Email,
                Phone = @Phone,
                Status = @Status,
                UpdatedAt = NOW()
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, member);
        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM users WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }
}