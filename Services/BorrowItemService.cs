using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class BorrowItemService : IBorrowItemService
{
    private readonly IBorrowItemRepository _borrowItemRepository;

    public BorrowItemService(IBorrowItemRepository borrowItemRepository)
    {
        _borrowItemRepository = borrowItemRepository;
    }

    public async Task<IEnumerable<BorrowItem>> GetAllAsync() => await _borrowItemRepository.GetAllAsync();
    public async Task<BorrowItem?> GetByIdAsync(int id) => await _borrowItemRepository.GetByIdAsync(id);
    public async Task<IEnumerable<BorrowItem>> GetByTransactionIdAsync(int transactionId) => await _borrowItemRepository.GetByTransactionIdAsync(transactionId);
    public async Task<IEnumerable<BorrowItem>> GetOverdueItemsAsync() => await _borrowItemRepository.GetOverdueItemsAsync();
    public async Task<int> CreateAsync(BorrowItem item) => await _borrowItemRepository.CreateAsync(item);
    public async Task<bool> UpdateAsync(BorrowItem item) => await _borrowItemRepository.UpdateAsync(item);
    public async Task<bool> ReturnItemAsync(int id, string? conditionAtReturn) => await _borrowItemRepository.ReturnItemAsync(id, conditionAtReturn);
    public async Task<bool> RenewItemAsync(int id, DateTime newDueDate) => await _borrowItemRepository.RenewItemAsync(id, newDueDate);
    public async Task<bool> DeleteAsync(int id) => await _borrowItemRepository.DeleteAsync(id);
}