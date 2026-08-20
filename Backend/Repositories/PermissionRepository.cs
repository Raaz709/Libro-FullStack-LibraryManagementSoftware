using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class PermissionRepository : IPermissionRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PermissionRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Permission>> GetAllAsync()
    {
        const string sql = @"
            SELECT p.Id, p.Name, p.Description,
                   GROUP_CONCAT(r.Name ORDER BY r.Id SEPARATOR ', ') AS AssignedRoles
            FROM permissions p
            LEFT JOIN rolepermissions rp ON rp.PermissionId = p.Id
            LEFT JOIN roles r ON r.Id = rp.RoleId
            GROUP BY p.Id, p.Name, p.Description
            ORDER BY p.Name;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Permission>(sql);
    }

    public async Task<Permission?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, Name, Description
            FROM permissions
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Permission>(sql, new { Id = id });
    }

    public async Task<IEnumerable<RoleInfo>> GetRolesAsync()
    {
        const string sql = "SELECT Id, Name FROM roles ORDER BY Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<RoleInfo>(sql);
    }

    public async Task<int> CreateAsync(Permission permission)
    {
        const string sql = @"
            INSERT INTO permissions (Name, Description)
            VALUES (@Name, @Description);
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, permission);
    }

    public async Task<bool> UpdateAsync(Permission permission)
    {
        const string sql = @"
            UPDATE permissions
            SET Name = @Name,
                Description = @Description
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, permission);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM permissions WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }

    public async Task<bool> AssignAsync(int roleId, int permissionId)
    {
        const string sql = @"
            INSERT IGNORE INTO rolepermissions (RoleId, PermissionId)
            VALUES (@RoleId, @PermissionId);";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { RoleId = roleId, PermissionId = permissionId });
        return rows > 0;
    }

    public async Task<bool> RevokeAsync(int roleId, int permissionId)
    {
        const string sql = @"
            DELETE FROM rolepermissions
            WHERE RoleId = @RoleId AND PermissionId = @PermissionId;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { RoleId = roleId, PermissionId = permissionId });
        return rows > 0;
    }
}