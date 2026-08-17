using Library_Management.DTOs.Author;
using Library_Management.Models;

namespace Library_Management.Services.Interface;

public interface IAuthorService
{
    Task<IEnumerable<Author>> GetAllAsync();
    Task<Author?> GetByIdAsync(int id);
    Task<Author> CreateAsync(CreateAuthorDto dto);
    Task<bool> UpdateAsync(int id, UpdateAuthorDto dto);
    Task<bool> DeleteAsync(int id);
}