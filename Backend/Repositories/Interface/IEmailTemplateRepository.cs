using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IEmailTemplateRepository
{
    Task<IEnumerable<EmailTemplate>> GetAllAsync();
    Task<EmailTemplate?> GetByIdAsync(int id);
    Task<EmailTemplate?> GetByCodeAsync(string code);
    Task<int> CreateAsync(EmailTemplate template);
    Task<bool> UpdateAsync(EmailTemplate template);
    Task<bool> DeleteAsync(int id);
}