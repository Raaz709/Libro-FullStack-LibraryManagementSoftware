using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class BookCopyService : IBookCopyService
{
    private readonly IBookCopyRepository _bookCopyRepository;

    public BookCopyService(IBookCopyRepository bookCopyRepository)
    {
        _bookCopyRepository = bookCopyRepository;
    }

    public async Task<IEnumerable<BookCopy>> GetAllAsync() => await _bookCopyRepository.GetAllAsync();
    public async Task<IEnumerable<BookCopy>> GetByBookIdAsync(int bookId) => await _bookCopyRepository.GetByBookIdAsync(bookId);
    public async Task<BookCopy?> GetByIdAsync(int id) => await _bookCopyRepository.GetByIdAsync(id);
    public async Task<BookCopy?> GetByBarcodeAsync(string barcode) => await _bookCopyRepository.GetByBarcodeAsync(barcode);
    public async Task<int> CreateAsync(BookCopy bookCopy) => await _bookCopyRepository.CreateAsync(bookCopy);
    public async Task<bool> UpdateAsync(BookCopy bookCopy) => await _bookCopyRepository.UpdateAsync(bookCopy);
    public async Task<bool> DeleteAsync(int id) => await _bookCopyRepository.DeleteAsync(id);
}