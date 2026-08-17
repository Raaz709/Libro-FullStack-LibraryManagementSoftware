using Library_Management.Models;

namespace Library_Management.Services;

public interface IBorrowTransactionService
{
    Task<IEnumerable<BorrowTransaction>> GetAllAsync();
    Task<BorrowTransaction?> GetByIdAsync(int id);
    Task<IEnumerable<BorrowTransaction>> GetByUserIdAsync(int userId);
    Task<int> CreateAsync(BorrowTransaction transaction);
    Task<bool> UpdateAsync(BorrowTransaction transaction);
    Task<bool> DeleteAsync(int id);
}