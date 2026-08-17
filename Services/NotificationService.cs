using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<IEnumerable<Notification>> GetAllAsync() => await _notificationRepository.GetAllAsync();
    public async Task<Notification?> GetByIdAsync(int id) => await _notificationRepository.GetByIdAsync(id);
    public async Task<IEnumerable<Notification>> GetByUserIdAsync(int userId) => await _notificationRepository.GetByUserIdAsync(userId);
    public async Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(int userId) => await _notificationRepository.GetUnreadByUserIdAsync(userId);
    public async Task<int> CreateAsync(Notification notification) => await _notificationRepository.CreateAsync(notification);
    public async Task<bool> MarkAsReadAsync(int id) => await _notificationRepository.MarkAsReadAsync(id);
    public async Task<bool> MarkAllAsReadByUserIdAsync(int userId) => await _notificationRepository.MarkAllAsReadByUserIdAsync(userId);
    public async Task<bool> DeleteAsync(int id) => await _notificationRepository.DeleteAsync(id);
}