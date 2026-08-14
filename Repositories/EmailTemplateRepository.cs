using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class EmailTemplateRepository : IEmailTemplateRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public EmailTemplateRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<EmailTemplate>> GetAllAsync()
    {
        const string sql = @"
            SELECT Id, Name, Code, Subject, BodyHtml, Description, CreatedAt, UpdatedAt
            FROM emailtemplates
            ORDER BY Name ASC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<EmailTemplate>(sql);
    }

    public async Task<EmailTemplate?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, Name, Code, Subject, BodyHtml, Description, CreatedAt, UpdatedAt
            FROM emailtemplates
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<EmailTemplate>(sql, new { Id = id });
    }

    public async Task<EmailTemplate?> GetByCodeAsync(string code)
    {
        const string sql = @"
            SELECT Id, Name, Code, Subject, BodyHtml, Description, CreatedAt, UpdatedAt
            FROM emailtemplates
            WHERE Code = @Code;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<EmailTemplate>(sql, new { Code = code });
    }

    public async Task<int> CreateAsync(EmailTemplate template)
    {
        const string sql = @"
            INSERT INTO emailtemplates (Name, Code, Subject, BodyHtml, Description, CreatedAt, UpdatedAt)
            VALUES (@Name, @Code, @Subject, @BodyHtml, @Description, NOW(), NOW());
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, template);
    }

    public async Task<bool> UpdateAsync(EmailTemplate template)
    {
        const string sql = @"
            UPDATE emailtemplates
            SET Name = @Name,
                Code = @Code,
                Subject = @Subject,
                BodyHtml = @BodyHtml,
                Description = @Description,
                UpdatedAt = NOW()
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, template);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM emailtemplates WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}