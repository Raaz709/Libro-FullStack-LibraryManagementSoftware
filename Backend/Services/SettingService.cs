using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public interface ISettingService
{
    Task<IEnumerable<Setting>> GetAllAsync();
    Task<Setting?> GetAsync(string key);
    Task UpsertAsync(string key, string value, string? description, int? updatedByUserId);
    Task<bool> DeleteAsync(string key);
}

public class SettingService : ISettingService
{
    private readonly ISettingRepository _settingRepository;

    public SettingService(ISettingRepository settingRepository)
    {
        _settingRepository = settingRepository;
    }

    public Task<IEnumerable<Setting>> GetAllAsync() => _settingRepository.GetAllAsync();

    public Task<Setting?> GetAsync(string key) => _settingRepository.GetAsync(key);

    public async Task UpsertAsync(string key, string value, string? description, int? updatedByUserId)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new ArgumentException("Setting key is required.", nameof(key));
        }

        await _settingRepository.UpsertAsync(new Setting
        {
            Key = key.Trim(),
            Value = value,
            Description = description,
            UpdatedByUserId = updatedByUserId
        });
    }

    public Task<bool> DeleteAsync(string key) => _settingRepository.DeleteAsync(key);
}