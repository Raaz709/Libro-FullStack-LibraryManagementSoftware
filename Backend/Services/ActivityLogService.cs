using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly IActivityLogRepository _activityLogRepository;

    public ActivityLogService(IActivityLogRepository activityLogRepository)
    {
        _activityLogRepository = activityLogRepository;
    }

    public async Task<IEnumerable<ActivityLog>> GetAllAsync() => await _activityLogRepository.GetAllAsync();
    public async Task<ActivityLog?> GetByIdAsync(int id) => await _activityLogRepository.GetByIdAsync(id);
    public async Task<IEnumerable<ActivityLog>> GetByUserIdAsync(int userId) => await _activityLogRepository.GetByUserIdAsync(userId);
    public async Task<int> CreateAsync(ActivityLog log) => await _activityLogRepository.CreateAsync(log);
    public async Task<bool> DeleteAsync(int id) => await _activityLogRepository.DeleteAsync(id);
}