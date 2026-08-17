using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class EmailTemplateService : IEmailTemplateService
{
    private readonly IEmailTemplateRepository _emailTemplateRepository;

    public EmailTemplateService(IEmailTemplateRepository emailTemplateRepository)
    {
        _emailTemplateRepository = emailTemplateRepository;
    }

    public async Task<IEnumerable<EmailTemplate>> GetAllAsync() => await _emailTemplateRepository.GetAllAsync();
    public async Task<EmailTemplate?> GetByIdAsync(int id) => await _emailTemplateRepository.GetByIdAsync(id);
    public async Task<EmailTemplate?> GetByCodeAsync(string code) => await _emailTemplateRepository.GetByCodeAsync(code);
    public async Task<int> CreateAsync(EmailTemplate template) => await _emailTemplateRepository.CreateAsync(template);
    public async Task<bool> UpdateAsync(EmailTemplate template) => await _emailTemplateRepository.UpdateAsync(template);
    public async Task<bool> DeleteAsync(int id) => await _emailTemplateRepository.DeleteAsync(id);
}