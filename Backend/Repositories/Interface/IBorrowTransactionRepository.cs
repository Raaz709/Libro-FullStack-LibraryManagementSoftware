using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IBorrowTransactionRepository
{
    Task<IEnumerable<BorrowTransaction>> GetAllAsync();
    Task<BorrowTransaction?> GetByIdAsync(int id);
    Task<IEnumerable<BorrowTransaction>> GetByUserIdAsync(int userId);
    Task<int> CreateAsync(BorrowTransaction transaction);
    Task<bool> UpdateAsync(BorrowTransaction transaction);
    Task<bool> DeleteAsync(int id);
}