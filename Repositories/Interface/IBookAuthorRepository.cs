using Library_Management.Models;

namespace Library_Management.Repositories.Interface;

public interface IBookAuthorRepository
{
    Task<IEnumerable<Author>> GetAuthorsByBookIdAsync(int bookId);
    Task<bool> AddAuthorToBookAsync(int bookId, int authorId, bool isPrimary);
    Task<bool> RemoveAuthorFromBookAsync(int bookId, int authorId);
}