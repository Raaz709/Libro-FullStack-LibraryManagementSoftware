using Library_Management.DTOs.Book;
using Library_Management.Models;
using Library_Management.Repositories.Interface;
using Library_Management.Services.Interface;

namespace Library_Management.Services;

public class BookService : IBookService
{
    private readonly IBookRepository _bookRepository;

    public BookService(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    public async Task<IEnumerable<BookResponse>> GetAllAsync()
    {
        var books = await _bookRepository.GetAllAsync();

        return books.Select(MapToResponse);
    }

    public async Task<PagedResult<BookResponse>> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        string? status = null,
        string? language = null,
        int? categoryId = null,
        string? sort = null)
    {
        var paged = await _bookRepository.GetPagedAsync(
            page, pageSize, search, status, language, categoryId, sort);

        return new PagedResult<BookResponse>
        {
            Items = paged.Items.Select(MapToResponse),
            Total = paged.Total,
            Page = paged.Page,
            PageSize = paged.PageSize
        };
    }

    public async Task<BookResponse?> GetByIdAsync(int id)
    {
        var book = await _bookRepository.GetByIdAsync(id);

        return book is null ? null : MapToResponse(book);
    }

    public async Task<BookResponse> CreateAsync(CreateBookRequest request)
    {
        var book = new Book
        {
            ISBN = request.ISBN,
            Title = request.Title,
            Subtitle = request.Subtitle,
            Description = request.Description,
            Language = request.Language,
            Edition = request.Edition,
            PublisherId = request.PublisherId,
            PublishedDate = request.PublishedDate,
            Price = request.Price,
            CoverImageUrl = request.CoverImageUrl,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };

        var id = await _bookRepository.CreateAsync(book);

        book.Id = id;

        return MapToResponse(book);
    }

    public async Task<bool> UpdateAsync(
        int id,
        UpdateBookRequest request)
    {
        var existingBook = await _bookRepository.GetByIdAsync(id);

        if (existingBook is null)
        {
            return false;
        }

        existingBook.ISBN = request.ISBN;
        existingBook.Title = request.Title;
        existingBook.Subtitle = request.Subtitle;
        existingBook.Description = request.Description;
        existingBook.Language = request.Language;
        existingBook.Edition = request.Edition;
        existingBook.PublisherId = request.PublisherId;
        existingBook.PublishedDate = request.PublishedDate;
        existingBook.Price = request.Price;
        existingBook.CoverImageUrl = request.CoverImageUrl;
        existingBook.Status = request.Status;

        return await _bookRepository.UpdateAsync(existingBook);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _bookRepository.DeleteAsync(id);
    }

    private static BookResponse MapToResponse(Book book)
    {
        return new BookResponse
        {
            Id = book.Id,
            ISBN = book.ISBN,
            Title = book.Title,
            Subtitle = book.Subtitle,
            Description = book.Description,
            Language = book.Language,
            Edition = book.Edition,
            PublisherId = book.PublisherId,
            PublishedDate = book.PublishedDate,
            Price = book.Price,
            CoverImageUrl = book.CoverImageUrl,
            Status = book.Status,
            CreatedAt = book.CreatedAt
        };
    }
}