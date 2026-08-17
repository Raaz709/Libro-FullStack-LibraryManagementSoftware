using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IBookCategoryRepository
{
    Task<IEnumerable<Category>> GetCategoriesByBookIdAsync(int bookId);
    Task<IEnumerable<Book>> GetBooksByCategoryIdAsync(int categoryId);
    Task<bool> AssignCategoryAsync(int bookId, int categoryId);
    Task<bool> RemoveCategoryAsync(int bookId, int categoryId);
}