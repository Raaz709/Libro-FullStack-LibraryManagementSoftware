using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IBorrowItemRepository
{
    Task<IEnumerable<BorrowItem>> GetAllAsync();
    Task<BorrowItem?> GetByIdAsync(int id);
    Task<IEnumerable<BorrowItem>> GetByTransactionIdAsync(int transactionId);
    Task<IEnumerable<BorrowItem>> GetOverdueItemsAsync();
    Task<int> CreateAsync(BorrowItem item);
    Task<bool> UpdateAsync(BorrowItem item);
    Task<bool> ReturnItemAsync(int id, string? conditionAtReturn);
    Task<bool> RenewItemAsync(int id, DateTime newDueDate);
    Task<bool> DeleteAsync(int id);
}