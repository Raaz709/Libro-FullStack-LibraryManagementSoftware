using Library_Management.DTOs.Book;

namespace Library_Management.Services;

public interface IBookService
{
    Task<IEnumerable<BookResponse>> GetAllAsync();

    Task<BookResponse?> GetByIdAsync(int id);

    Task<BookResponse> CreateAsync(CreateBookRequest request);

    Task<bool> UpdateAsync(int id, UpdateBookRequest request);

    Task<bool> DeleteAsync(int id);
}