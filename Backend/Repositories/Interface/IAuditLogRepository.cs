using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IAuditLogRepository
{
    Task<IEnumerable<AuditLog>> GetAllAsync();
    Task<AuditLog?> GetByIdAsync(int id);
    Task<IEnumerable<AuditLog>> GetByEntityTypeAsync(string entityType, int entityId);
    Task<IEnumerable<AuditLog>> GetByUserIdAsync(int userId);
    Task<int> CreateAsync(AuditLog log);
    Task<bool> DeleteAsync(int id);
}