using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IPermissionRepository
{
    Task<IEnumerable<Permission>> GetAllAsync();
    Task<Permission?> GetByIdAsync(int id);
    Task<IEnumerable<RoleInfo>> GetRolesAsync();
    Task<int> CreateAsync(Permission permission);
    Task<bool> UpdateAsync(Permission permission);
    Task<bool> DeleteAsync(int id);
    Task<bool> AssignAsync(int roleId, int permissionId);
    Task<bool> RevokeAsync(int roleId, int permissionId);
}