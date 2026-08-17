using Library_Management.Models;

namespace Library_Management.Services;

public interface IBookCopyService
{
    Task<IEnumerable<BookCopy>> GetAllAsync();
    Task<IEnumerable<BookCopy>> GetByBookIdAsync(int bookId);
    Task<BookCopy?> GetByIdAsync(int id);
    Task<BookCopy?> GetByBarcodeAsync(string barcode);
    Task<int> CreateAsync(BookCopy bookCopy);
    Task<bool> UpdateAsync(BookCopy bookCopy);
    Task<bool> DeleteAsync(int id);
}