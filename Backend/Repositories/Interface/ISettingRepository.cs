using Library_Management.Models;

namespace Library_Management.Repositories;

public interface ISettingRepository
{
    Task<IEnumerable<Setting>> GetAllAsync();
    Task<Setting?> GetAsync(string key);
    Task UpsertAsync(Setting setting);
    Task<bool> DeleteAsync(string key);
}