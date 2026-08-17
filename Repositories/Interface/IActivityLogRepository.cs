using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IActivityLogRepository
{
    Task<IEnumerable<ActivityLog>> GetAllAsync();
    Task<ActivityLog?> GetByIdAsync(int id);
    Task<IEnumerable<ActivityLog>> GetByUserIdAsync(int userId);
    Task<int> CreateAsync(ActivityLog log);
    Task<bool> DeleteAsync(int id);
}