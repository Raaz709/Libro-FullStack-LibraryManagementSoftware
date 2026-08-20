using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IFineRepository _fineRepository;
    private readonly INotificationService _notificationService;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IFineRepository fineRepository,
        INotificationService notificationService)
    {
        _paymentRepository = paymentRepository;
        _fineRepository = fineRepository;
        _notificationService = notificationService;
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

        var id = await _paymentRepository.CreateAsync(payment);
        if (id > 0)
        {
            await _notificationService.NotifyAsync(
                authenticatedUserId,
                "Payment received",
                $"Your payment of Rs. {payment.Amount:N2} for fine #{payment.FineId} was received.",
                "Success",
                payment.FineId);
        }

        return id;
    }

    public async Task<bool> DeleteAsync(int id) =>
        await _paymentRepository.DeleteAsync(id);
}