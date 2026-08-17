using Library_Management.DTOs.Publisher;
using Library_Management.Models;

namespace Library_Management.Services.Interface;

public interface IPublisherService
{
    Task<IEnumerable<Publisher>> GetAllAsync();
    Task<Publisher?> GetByIdAsync(int id);
    Task<Publisher> CreateAsync(CreatePublisherDto dto);
    Task<bool> UpdateAsync(int id, UpdatePublisherDto dto);
    Task<bool> DeleteAsync(int id);
}