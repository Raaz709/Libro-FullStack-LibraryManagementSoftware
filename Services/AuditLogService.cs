using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _auditLogRepository;

    public AuditLogService(IAuditLogRepository auditLogRepository)
    {
        _auditLogRepository = auditLogRepository;
    }

    public async Task<IEnumerable<AuditLog>> GetAllAsync() => await _auditLogRepository.GetAllAsync();
    public async Task<AuditLog?> GetByIdAsync(int id) => await _auditLogRepository.GetByIdAsync(id);
    public async Task<IEnumerable<AuditLog>> GetByEntityTypeAsync(string entityType, int entityId) => await _auditLogRepository.GetByEntityTypeAsync(entityType, entityId);
    public async Task<IEnumerable<AuditLog>> GetByUserIdAsync(int userId) => await _auditLogRepository.GetByUserIdAsync(userId);
    public async Task<int> CreateAsync(AuditLog log) => await _auditLogRepository.CreateAsync(log);
    public async Task<bool> DeleteAsync(int id) => await _auditLogRepository.DeleteAsync(id);
}