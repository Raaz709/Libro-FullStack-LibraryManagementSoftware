using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class BookCategoryService : IBookCategoryService
{
    private readonly IBookCategoryRepository _bookCategoryRepository;

    public BookCategoryService(IBookCategoryRepository bookCategoryRepository)
    {
        _bookCategoryRepository = bookCategoryRepository;
    }

    public async Task<IEnumerable<Category>> GetCategoriesByBookIdAsync(int bookId) => await _bookCategoryRepository.GetCategoriesByBookIdAsync(bookId);
    public async Task<IEnumerable<Book>> GetBooksByCategoryIdAsync(int categoryId) => await _bookCategoryRepository.GetBooksByCategoryIdAsync(categoryId);
    public async Task<bool> AssignCategoryAsync(int bookId, int categoryId) => await _bookCategoryRepository.AssignCategoryAsync(bookId, categoryId);
    public async Task<bool> RemoveCategoryAsync(int bookId, int categoryId) => await _bookCategoryRepository.RemoveCategoryAsync(bookId, categoryId);
}