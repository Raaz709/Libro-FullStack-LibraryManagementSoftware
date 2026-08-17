using Library_Management.DTOs.Category;
using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Category> CreateAsync(CreateCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description
        };

        var newId = await _repository.CreateAsync(category);
        category.Id = newId;

        return category;
    }

    public async Task<bool> UpdateAsync(int id, UpdateCategoryDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null) return false;

        existing.Name = dto.Name;
        existing.Description = dto.Description;

        return await _repository.UpdateAsync(existing);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null) return false;

        return await _repository.DeleteAsync(id);
    }
}