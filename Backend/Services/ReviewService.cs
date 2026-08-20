using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public interface IReviewService
{
    Task<IEnumerable<Review>> GetByBookIdAsync(int bookId);
    Task<ReviewSummary?> GetSummaryAsync(int bookId);
    Task<int> CreateAsync(int userId, int bookId, byte rating, string? comment);
    Task<bool> UpdateAsync(int userId, int reviewId, byte rating, string? comment);
    Task<bool> DeleteAsync(int userId, int reviewId, bool isStaff);
}

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;

    public ReviewService(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<IEnumerable<Review>> GetByBookIdAsync(int bookId) =>
        await _reviewRepository.GetByBookIdAsync(bookId);

    public async Task<ReviewSummary?> GetSummaryAsync(int bookId) =>
        await _reviewRepository.GetSummaryAsync(bookId);

    public async Task<int> CreateAsync(int userId, int bookId, byte rating, string? comment)
    {
        if (rating < 1 || rating > 5)
        {
            throw new InvalidOperationException("Rating must be between 1 and 5.");
        }

        var existing = await _reviewRepository.GetByUserBookAsync(userId, bookId);
        if (existing is not null)
        {
            throw new InvalidOperationException("You have already reviewed this book.");
        }

        var review = new Review
        {
            UserId = userId,
            BookId = bookId,
            Rating = rating,
            Comment = comment,
            Status = "Published"
        };

        return await _reviewRepository.CreateAsync(review);
    }

    public async Task<bool> UpdateAsync(int userId, int reviewId, byte rating, string? comment)
    {
        if (rating < 1 || rating > 5)
        {
            throw new InvalidOperationException("Rating must be between 1 and 5.");
        }

        var existing = await _reviewRepository.GetByIdAsync(reviewId);
        if (existing is null || existing.UserId != userId)
        {
            return false;
        }

        existing.Rating = rating;
        existing.Comment = comment;

        return await _reviewRepository.UpdateAsync(existing);
    }

    public async Task<bool> DeleteAsync(int userId, int reviewId, bool isStaff)
    {
        var existing = await _reviewRepository.GetByIdAsync(reviewId);
        if (existing is null)
        {
            return false;
        }

        if (!isStaff && existing.UserId != userId)
        {
            return false;
        }

        return await _reviewRepository.DeleteAsync(reviewId);
    }
}