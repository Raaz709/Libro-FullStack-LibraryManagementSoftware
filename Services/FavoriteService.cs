using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class FavoriteService : IFavoriteService
{
    private readonly IFavoriteRepository _favoriteRepository;

    public FavoriteService(IFavoriteRepository favoriteRepository)
    {
        _favoriteRepository = favoriteRepository;
    }

    public async Task<IEnumerable<Book>> GetFavoritesByUserIdAsync(int userId) => await _favoriteRepository.GetFavoritesByUserIdAsync(userId);
    public async Task<bool> IsFavoriteAsync(int userId, int bookId) => await _favoriteRepository.IsFavoriteAsync(userId, bookId);
    public async Task<bool> AddFavoriteAsync(int userId, int bookId) => await _favoriteRepository.AddFavoriteAsync(userId, bookId);
    public async Task<bool> RemoveFavoriteAsync(int userId, int bookId) => await _favoriteRepository.RemoveFavoriteAsync(userId, bookId);
}