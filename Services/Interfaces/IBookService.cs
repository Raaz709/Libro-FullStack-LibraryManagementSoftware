using Library_Management.DTOs;

namespace Library_Management.Services.Interfaces;

public interface IBookService
{
    Task<IEnumerable<BookResponse>> GetAllAsync();

    Task<BookResponse?> GetByIdAsync(int id);

    Task<BookResponse> CreateAsync(CreateBookRequest request);

    Task<bool> UpdateAsync(int id, UpdateBookRequest request);

    Task<bool> DeleteAsync(int id);
}