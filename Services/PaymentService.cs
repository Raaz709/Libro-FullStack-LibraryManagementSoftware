using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;

    public PaymentService(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    public async Task<IEnumerable<Payment>> GetAllAsync() => await _paymentRepository.GetAllAsync();
    public async Task<Payment?> GetByIdAsync(int id) => await _paymentRepository.GetByIdAsync(id);
    public async Task<IEnumerable<Payment>> GetByUserIdAsync(int userId) => await _paymentRepository.GetByUserIdAsync(userId);
    public async Task<IEnumerable<Payment>> GetByFineIdAsync(int fineId) => await _paymentRepository.GetByFineIdAsync(fineId);
    public async Task<int> CreateAsync(Payment payment) => await _paymentRepository.CreateAsync(payment);
    public async Task<bool> DeleteAsync(int id) => await _paymentRepository.DeleteAsync(id);
}