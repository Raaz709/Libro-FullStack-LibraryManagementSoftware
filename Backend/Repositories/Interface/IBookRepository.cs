using Library_Management.Models;

namespace Library_Management.Repositories.Interface;

public interface IBookRepository
{
    Task<IEnumerable<Book>> GetAllAsync();

    Task<PagedResult<Book>> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        string? status = null,
        string? language = null,
        int? categoryId = null,
        string? sort = null);

    Task<Book?> GetByIdAsync(int id);

    Task<int> CreateAsync(Book book);

    Task<bool> UpdateAsync(Book book);

    Task<bool> DeleteAsync(int id);
}