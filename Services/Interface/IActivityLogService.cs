using Library_Management.Models;

namespace Library_Management.Services;

public interface IActivityLogService
{
    Task<IEnumerable<ActivityLog>> GetAllAsync();
    Task<ActivityLog?> GetByIdAsync(int id);
    Task<IEnumerable<ActivityLog>> GetByUserIdAsync(int userId);
    Task<int> CreateAsync(ActivityLog log);
    Task<bool> DeleteAsync(int id);
}