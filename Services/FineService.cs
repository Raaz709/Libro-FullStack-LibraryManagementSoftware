using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class FineService : IFineService
{
    private readonly IFineRepository _fineRepository;

    public FineService(IFineRepository fineRepository)
    {
        _fineRepository = fineRepository;
    }

    public async Task<IEnumerable<Fine>> GetAllAsync() => await _fineRepository.GetAllAsync();
    public async Task<Fine?> GetByIdAsync(int id) => await _fineRepository.GetByIdAsync(id);
    public async Task<IEnumerable<Fine>> GetByUserIdAsync(int userId) => await _fineRepository.GetByUserIdAsync(userId);
    public async Task<IEnumerable<Fine>> GetUnpaidByUserIdAsync(int userId) => await _fineRepository.GetUnpaidByUserIdAsync(userId);
    public async Task<int> CreateAsync(Fine fine) => await _fineRepository.CreateAsync(fine);
    public async Task<bool> UpdateAsync(Fine fine) => await _fineRepository.UpdateAsync(fine);
    public async Task<bool> WaiveFineAsync(int id, int waivedByUserId) => await _fineRepository.WaiveFineAsync(id, waivedByUserId);
    public async Task<bool> DeleteAsync(int id) => await _fineRepository.DeleteAsync(id);
}