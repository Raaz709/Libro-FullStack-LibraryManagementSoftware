using Library_Management.DTOs.Author;
using Library_Management.Models;
using Library_Management.Repositories.Interface;
using Library_Management.Services.Interface;

namespace Library_Management.Services;

public class BookAuthorService : IBookAuthorService
{
    private readonly IBookAuthorRepository _repository;

    public BookAuthorService(IBookAuthorRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Author>> GetAuthorsForBookAsync(int bookId)
    {
        return await _repository.GetAuthorsByBookIdAsync(bookId);
    }

    public async Task<bool> AssignAuthorAsync(int bookId, AssignAuthorDto dto)
    {
        return await _repository.AddAuthorToBookAsync(bookId, dto.AuthorId, dto.IsPrimary);
    }

    public async Task<bool> RemoveAuthorAsync(int bookId, int authorId)
    {
        return await _repository.RemoveAuthorFromBookAsync(bookId, authorId);
    }
}