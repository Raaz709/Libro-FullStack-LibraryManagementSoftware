using Library_Management.DTOs.Book;
using Library_Management.Models;

namespace Library_Management.Services.Interface;

public interface IBookService
{
    Task<IEnumerable<BookResponse>> GetAllAsync();

    Task<PagedResult<BookResponse>> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        string? status = null,
        string? language = null,
        int? categoryId = null,
        string? sort = null);

    Task<BookResponse?> GetByIdAsync(int id);

    Task<BookResponse> CreateAsync(CreateBookRequest request);

    Task<bool> UpdateAsync(int id, UpdateBookRequest request);

    Task<bool> DeleteAsync(int id);
}