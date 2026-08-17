using Library_Management.Models;

namespace Library_Management.Repositories.Interface;

public interface IAuthorRepository
{
    Task<IEnumerable<Author>> GetAllAsync();
    Task<Author?> GetByIdAsync(int id);
    Task<int> CreateAsync(Author author);
    Task<bool> UpdateAsync(Author author);
    Task<bool> DeleteAsync(int id);
}