using Library_Management.DTOs.Publisher;
using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class PublisherService : IPublisherService
{
    private readonly IPublisherRepository _repository;

    public PublisherService(IPublisherRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Publisher>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Publisher?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Publisher> CreateAsync(CreatePublisherDto dto)
    {
        var publisher = new Publisher
        {
            Name = dto.Name,
            Website = dto.Website,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address
        };

        var newId = await _repository.CreateAsync(publisher);
        publisher.Id = newId;

        return publisher;
    }

    public async Task<bool> UpdateAsync(int id, UpdatePublisherDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return false;

        existing.Name = dto.Name;
        existing.Website = dto.Website;
        existing.Email = dto.Email;
        existing.Phone = dto.Phone;
        existing.Address = dto.Address;

        return await _repository.UpdateAsync(existing);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return false;

        return await _repository.DeleteAsync(id);
    }
}