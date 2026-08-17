using Library_Management.Models;

namespace Library_Management.Repositories.Interface;

public interface IBookRepository
{
    Task<IEnumerable<Book>> GetAllAsync();

    Task<Book?> GetByIdAsync(int id);

    Task<int> CreateAsync(Book book);

    Task<bool> UpdateAsync(Book book);

    Task<bool> DeleteAsync(int id);
}