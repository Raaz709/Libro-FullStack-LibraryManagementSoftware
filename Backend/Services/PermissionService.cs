using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public interface IPermissionService
{
    Task<IEnumerable<Permission>> GetAllAsync();
    Task<IEnumerable<RoleInfo>> GetRolesAsync();
    Task<int> CreateAsync(string name, string? description);
    Task<bool> UpdateAsync(int id, string name, string? description);
    Task<bool> DeleteAsync(int id);
    Task<bool> AssignAsync(int roleId, int permissionId);
    Task<bool> RevokeAsync(int roleId, int permissionId);
}

public class PermissionService : IPermissionService
{
    private readonly IPermissionRepository _permissionRepository;

    public PermissionService(IPermissionRepository permissionRepository)
    {
        _permissionRepository = permissionRepository;
    }

    public Task<IEnumerable<Permission>> GetAllAsync() => _permissionRepository.GetAllAsync();

    public Task<IEnumerable<RoleInfo>> GetRolesAsync() => _permissionRepository.GetRolesAsync();

    public async Task<int> CreateAsync(string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Permission name is required.", nameof(name));
        }

        return await _permissionRepository.CreateAsync(new Permission
        {
            Name = name.Trim(),
            Description = description
        });
    }

    public async Task<bool> UpdateAsync(int id, string name, string? description)
    {
        var existing = await _permissionRepository.GetByIdAsync(id);
        if (existing is null)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Permission name is required.", nameof(name));
        }

        return await _permissionRepository.UpdateAsync(new Permission
        {
            Id = id,
            Name = name.Trim(),
            Description = description
        });
    }

    public Task<bool> DeleteAsync(int id) => _permissionRepository.DeleteAsync(id);

    public Task<bool> AssignAsync(int roleId, int permissionId) =>
        _permissionRepository.AssignAsync(roleId, permissionId);

    public Task<bool> RevokeAsync(int roleId, int permissionId) =>
        _permissionRepository.RevokeAsync(roleId, permissionId);
}