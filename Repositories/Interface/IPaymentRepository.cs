using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IPaymentRepository
{
    Task<IEnumerable<Payment>> GetAllAsync();
    Task<Payment?> GetByIdAsync(int id);
    Task<IEnumerable<Payment>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Payment>> GetByFineIdAsync(int fineId);
    Task<int> CreateAsync(Payment payment);
    Task<bool> DeleteAsync(int id);
}