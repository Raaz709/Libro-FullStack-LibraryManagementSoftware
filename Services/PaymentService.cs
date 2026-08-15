using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IFineRepository _fineRepository;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IFineRepository fineRepository)
    {
        _paymentRepository = paymentRepository;
        _fineRepository = fineRepository;
    }

    public async Task<IEnumerable<Payment>> GetAllAsync() =>
        await _paymentRepository.GetAllAsync();

    public async Task<Payment?> GetByIdAsync(int id) =>
        await _paymentRepository.GetByIdAsync(id);

    public async Task<IEnumerable<Payment>> GetByUserIdAsync(int userId) =>
        await _paymentRepository.GetByUserIdAsync(userId);

    public async Task<IEnumerable<Payment>> GetByFineIdAsync(int fineId) =>
        await _paymentRepository.GetByFineIdAsync(fineId);

    public async Task<int?> CreateAsync(
        Payment payment,
        int authenticatedUserId)
    {
        var fine = await _fineRepository.GetByIdAsync(payment.FineId);

        if (fine is null)
            return null;

        // Student/Faculty can only pay their own fine.
        if (fine.UserId != authenticatedUserId)
            return null;

        // Only unpaid fines can be paid.
        if (!string.Equals(fine.Status, "Unpaid", StringComparison.OrdinalIgnoreCase))
            return null;

        // Full payment only.
        if (payment.Amount != fine.Amount)
            return null;

        // Never trust UserId from the request.
        payment.UserId = authenticatedUserId;

        return await _paymentRepository.CreateAsync(payment);
    }

    public async Task<bool> DeleteAsync(int id) =>
        await _paymentRepository.DeleteAsync(id);
}