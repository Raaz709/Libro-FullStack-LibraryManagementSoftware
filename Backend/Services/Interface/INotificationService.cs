using Library_Management.Models;

namespace Library_Management.Services;

public interface INotificationService
{
    Task<IEnumerable<Notification>> GetAllAsync();
    Task<Notification?> GetByIdAsync(int id);
    Task<IEnumerable<Notification>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(int userId);
    Task<int> CreateAsync(Notification notification);
    Task<bool> MarkAsReadAsync(int id);
    Task<bool> MarkAllAsReadByUserIdAsync(int userId);
    Task<bool> DeleteAsync(int id);
}