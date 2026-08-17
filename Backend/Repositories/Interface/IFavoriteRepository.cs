using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IFavoriteRepository
{
    Task<IEnumerable<Book>> GetFavoritesByUserIdAsync(int userId);
    Task<bool> IsFavoriteAsync(int userId, int bookId);
    Task<bool> AddFavoriteAsync(int userId, int bookId);
    Task<bool> RemoveFavoriteAsync(int userId, int bookId);
}