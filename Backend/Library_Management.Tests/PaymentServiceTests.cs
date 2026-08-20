using Library_Management.Models;
using Library_Management.Repositories;
using Library_Management.Services;
using Moq;
using Xunit;

namespace Library_Management.Tests;

public class PaymentServiceTests
{
    private readonly Mock<IPaymentRepository> _paymentRepo = new();
    private readonly Mock<IFineRepository> _fineRepo = new();
    private readonly Mock<INotificationService> _notificationService = new();

    private PaymentService CreateService() =>
        new(_paymentRepo.Object, _fineRepo.Object, _notificationService.Object);

    private static Fine UnpaidFine(int userId = 42, decimal amount = 100m) => new()
    {
        Id = 5,
        UserId = userId,
        Amount = amount,
        Status = "Unpaid"
    };

    [Fact]
    public async Task CreateAsync_ValidPayment_CreatesAndNotifies()
    {
        _fineRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(UnpaidFine());
        _paymentRepo.Setup(r => r.CreateAsync(It.IsAny<Payment>())).ReturnsAsync(10);

        var id = await CreateService().CreateAsync(
            new Payment { FineId = 5, Amount = 100m, UserId = 999 },
            42);

        Assert.Equal(10, id);
        _paymentRepo.Verify(r => r.CreateAsync(It.Is<Payment>(p =>
            p.UserId == 42 && p.Amount == 100m && p.FineId == 5)), Times.Once);
        _notificationService.Verify(n => n.NotifyAsync(
            42,
            "Payment received",
            It.Is<string>(m => m.Contains("100.00")),
            "Success",
            5), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_FineNotFound_ReturnsNull()
    {
        _fineRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync((Fine?)null);

        var id = await CreateService().CreateAsync(
            new Payment { FineId = 5, Amount = 100m },
            42);

        Assert.Null(id);
        _paymentRepo.Verify(r => r.CreateAsync(It.IsAny<Payment>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_FineOwnedByAnotherUser_ReturnsNull()
    {
        _fineRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(UnpaidFine(userId: 99));

        var id = await CreateService().CreateAsync(
            new Payment { FineId = 5, Amount = 100m },
            42);

        Assert.Null(id);
        _paymentRepo.Verify(r => r.CreateAsync(It.IsAny<Payment>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_AlreadyPaidFine_ReturnsNull()
    {
        var fine = UnpaidFine();
        fine.Status = "Paid";
        _fineRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(fine);

        var id = await CreateService().CreateAsync(
            new Payment { FineId = 5, Amount = 100m },
            42);

        Assert.Null(id);
        _paymentRepo.Verify(r => r.CreateAsync(It.IsAny<Payment>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_PartialAmount_ReturnsNull()
    {
        _fineRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(UnpaidFine(amount: 150m));

        var id = await CreateService().CreateAsync(
            new Payment { FineId = 5, Amount = 100m },
            42);

        Assert.Null(id);
    }

    [Fact]
    public async Task CreateAsync_SpoofedUserId_IsOverwritten()
    {
        _fineRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(UnpaidFine());
        _paymentRepo.Setup(r => r.CreateAsync(It.IsAny<Payment>())).ReturnsAsync(10);

        await CreateService().CreateAsync(
            new Payment { FineId = 5, Amount = 100m, UserId = 999 },
            42);

        _paymentRepo.Verify(r => r.CreateAsync(It.Is<Payment>(p => p.UserId == 42)), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_FailedPersist_DoesNotNotify()
    {
        _fineRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(UnpaidFine());
        _paymentRepo.Setup(r => r.CreateAsync(It.IsAny<Payment>())).ReturnsAsync(0);

        var id = await CreateService().CreateAsync(
            new Payment { FineId = 5, Amount = 100m },
            42);

        Assert.Equal(0, id);
        _notificationService.Verify(n => n.NotifyAsync(
            It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<int?>()), Times.Never);
    }
}