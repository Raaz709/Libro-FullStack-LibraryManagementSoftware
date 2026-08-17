using Library_Management.DTOs.Author;
using Library_Management.Models;

namespace Library_Management.Services.Interface;

public interface IBookAuthorService
{
    Task<IEnumerable<Author>> GetAuthorsForBookAsync(int bookId);
    Task<bool> AssignAuthorAsync(int bookId, AssignAuthorDto dto);
    Task<bool> RemoveAuthorAsync(int bookId, int authorId);
}