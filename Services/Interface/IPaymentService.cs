using Library_Management.Models;

namespace Library_Management.Services;

public interface IPaymentService
{
    Task<IEnumerable<Payment>> GetAllAsync();
    Task<Payment?> GetByIdAsync(int id);
    Task<IEnumerable<Payment>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Payment>> GetByFineIdAsync(int fineId);

    Task<int?> CreateAsync(
        Payment payment,
        int authenticatedUserId);

    Task<bool> DeleteAsync(int id);
}