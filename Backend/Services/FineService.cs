using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class FineService : IFineService
{
    private readonly IFineRepository _fineRepository;
    private readonly INotificationService _notificationService;

    public FineService(
        IFineRepository fineRepository,
        INotificationService notificationService)
    {
        _fineRepository = fineRepository;
        _notificationService = notificationService;
    }

    public async Task<IEnumerable<Fine>> GetAllAsync() => await _fineRepository.GetAllAsync();
    public async Task<Fine?> GetByIdAsync(int id) => await _fineRepository.GetByIdAsync(id);
    public async Task<IEnumerable<Fine>> GetByUserIdAsync(int userId) => await _fineRepository.GetByUserIdAsync(userId);
    public async Task<IEnumerable<Fine>> GetUnpaidByUserIdAsync(int userId) => await _fineRepository.GetUnpaidByUserIdAsync(userId);
    public async Task<bool> UpdateAsync(Fine fine) => await _fineRepository.UpdateAsync(fine);
    public async Task<bool> DeleteAsync(int id) => await _fineRepository.DeleteAsync(id);

    public async Task<int> CreateAsync(Fine fine)
    {
        var id = await _fineRepository.CreateAsync(fine);
        await _notificationService.NotifyAsync(
            fine.UserId,
            "New fine",
            $"A {fine.Type} fine of Rs. {fine.Amount:N2} has been added to your account.",
            "Warning",
            id);
        return id;
    }

    public async Task<bool> WaiveFineAsync(int id, int waivedByUserId)
    {
        var waived = await _fineRepository.WaiveFineAsync(id, waivedByUserId);
        if (waived)
        {
            var fine = await _fineRepository.GetByIdAsync(id);
            if (fine is not null)
            {
                await _notificationService.NotifyAsync(
                    fine.UserId,
                    "Fine waived",
                    $"Your {fine.Type} fine of Rs. {fine.Amount:N2} has been waived.",
                    "Info",
                    id);
            }
        }
        return waived;
    }
}