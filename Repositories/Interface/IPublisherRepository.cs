using Library_Management.Models;

namespace Library_Management.Repositories.Interface;

public interface IPublisherRepository
{
    Task<IEnumerable<Publisher>> GetAllAsync();
    Task<Publisher?> GetByIdAsync(int id);
    Task<int> CreateAsync(Publisher publisher);
    Task<bool> UpdateAsync(Publisher publisher);
    Task<bool> DeleteAsync(int id);
}