using Library_Management.DTOs.Author;
using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class AuthorService : IAuthorService
{
    private readonly IAuthorRepository _repository;

    public AuthorService(IAuthorRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Author>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Author?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Author> CreateAsync(CreateAuthorDto dto)
    {
        var author = new Author
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Biography = dto.Biography,
            Country = dto.Country,
            BirthDate = dto.BirthDate,
            PhotoUrl = dto.PhotoUrl
        };

        var newId = await _repository.CreateAsync(author);
        author.Id = newId;

        return author;
    }

    public async Task<bool> UpdateAsync(int id, UpdateAuthorDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return false;

        existing.FirstName = dto.FirstName;
        existing.LastName = dto.LastName;
        existing.Biography = dto.Biography;
        existing.Country = dto.Country;
        existing.BirthDate = dto.BirthDate;
        existing.PhotoUrl = dto.PhotoUrl;

        return await _repository.UpdateAsync(existing);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return false;

        return await _repository.DeleteAsync(id);
    }
}