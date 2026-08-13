using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class BorrowTransactionService : IBorrowTransactionService
{
    private readonly IBorrowTransactionRepository _borrowTransactionRepository;

    public BorrowTransactionService(IBorrowTransactionRepository borrowTransactionRepository)
    {
        _borrowTransactionRepository = borrowTransactionRepository;
    }

    public async Task<IEnumerable<BorrowTransaction>> GetAllAsync() => await _borrowTransactionRepository.GetAllAsync();
    public async Task<BorrowTransaction?> GetByIdAsync(int id) => await _borrowTransactionRepository.GetByIdAsync(id);
    public async Task<IEnumerable<BorrowTransaction>> GetByUserIdAsync(int userId) => await _borrowTransactionRepository.GetByUserIdAsync(userId);
    public async Task<int> CreateAsync(BorrowTransaction transaction) => await _borrowTransactionRepository.CreateAsync(transaction);
    public async Task<bool> UpdateAsync(BorrowTransaction transaction) => await _borrowTransactionRepository.UpdateAsync(transaction);
    public async Task<bool> DeleteAsync(int id) => await _borrowTransactionRepository.DeleteAsync(id);
}