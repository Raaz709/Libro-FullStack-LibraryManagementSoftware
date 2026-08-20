using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IReviewRepository
{
    Task<IEnumerable<Review>> GetByBookIdAsync(int bookId);
    Task<Review?> GetByIdAsync(int id);
    Task<Review?> GetByUserBookAsync(int userId, int bookId);
    Task<ReviewSummary?> GetSummaryAsync(int bookId);
    Task<int> CreateAsync(Review review);
    Task<bool> UpdateAsync(Review review);
    Task<bool> DeleteAsync(int id);
}