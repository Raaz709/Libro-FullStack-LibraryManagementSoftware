using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IFineRepository
{
    Task<IEnumerable<Fine>> GetAllAsync();
    Task<Fine?> GetByIdAsync(int id);
    Task<IEnumerable<Fine>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Fine>> GetUnpaidByUserIdAsync(int userId);
    Task<int> CreateAsync(Fine fine);
    Task<bool> UpdateAsync(Fine fine);
    Task<bool> WaiveFineAsync(int id, int waivedByUserId);
    Task<bool> DeleteAsync(int id);
}