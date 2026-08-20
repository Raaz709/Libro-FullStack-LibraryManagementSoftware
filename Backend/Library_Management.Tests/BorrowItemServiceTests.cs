using Library_Management.Models;
using Library_Management.Repositories;
using Library_Management.Services;
using Moq;
using Xunit;

namespace Library_Management.Tests;

public class BorrowItemServiceTests
{
    private readonly Mock<IBorrowItemRepository> _borrowRepo = new();
    private readonly Mock<INotificationService> _notificationService = new();

    private BorrowItemService CreateService() =>
        new(_borrowRepo.Object, _notificationService.Object);

    private static BorrowItemNotificationContext Context(int userId = 3) => new()
    {
        UserId = userId,
        BookTitle = "1984"
    };

    [Fact]
    public async Task CreateAsync_NotifiesBorrower()
    {
        _borrowRepo.Setup(r => r.CreateAsync(It.IsAny<BorrowItem>())).ReturnsAsync(7);
        _borrowRepo.Setup(r => r.GetNotificationContextAsync(2, 9))
            .ReturnsAsync(Context());

        var id = await CreateService().CreateAsync(new BorrowItem
        {
            BorrowTransactionId = 2,
            BookCopyId = 9,
            DueDate = new DateTime(2026, 9, 1)
        });

        Assert.Equal(7, id);
        _notificationService.Verify(n => n.NotifyAsync(
            3,
            "Borrowed: 1984",
            It.Is<string>(m => m.Contains("01 Sep 2026")),
            "Info",
            7), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_NoContext_SkipsNotification()
    {
        _borrowRepo.Setup(r => r.CreateAsync(It.IsAny<BorrowItem>())).ReturnsAsync(7);
        _borrowRepo.Setup(r => r.GetNotificationContextAsync(It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync((BorrowItemNotificationContext?)null);

        await CreateService().CreateAsync(new BorrowItem
        {
            BorrowTransactionId = 2,
            BookCopyId = 9
        });

        _notificationService.Verify(n => n.NotifyAsync(
            It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<int?>()), Times.Never);
    }

    [Fact]
    public async Task ReturnItemAsync_Success_Notifies()
    {
        _borrowRepo.Setup(r => r.ReturnItemAsync(7, "Good")).ReturnsAsync(true);
        _borrowRepo.Setup(r => r.GetNotificationContextByItemIdAsync(7))
            .ReturnsAsync(Context());

        var result = await CreateService().ReturnItemAsync(7, "Good");

        Assert.True(result);
        _notificationService.Verify(n => n.NotifyAsync(
            3,
            "Returned: 1984",
            It.IsAny<string>(),
            "Info",
            7), Times.Once);
    }

    [Fact]
    public async Task ReturnItemAsync_Failed_DoesNotNotify()
    {
        _borrowRepo.Setup(r => r.ReturnItemAsync(7, null)).ReturnsAsync(false);

        var result = await CreateService().ReturnItemAsync(7, null);

        Assert.False(result);
        _notificationService.Verify(n => n.NotifyAsync(
            It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<int?>()), Times.Never);
    }

    [Fact]
    public async Task RenewItemAsync_Success_NotifiesWithNewDueDate()
    {
        var newDue = new DateTime(2026, 10, 15);
        _borrowRepo.Setup(r => r.RenewItemAsync(7, newDue)).ReturnsAsync(true);
        _borrowRepo.Setup(r => r.GetNotificationContextByItemIdAsync(7))
            .ReturnsAsync(Context());

        var result = await CreateService().RenewItemAsync(7, newDue);

        Assert.True(result);
        _notificationService.Verify(n => n.NotifyAsync(
            3,
            "Renewed: 1984",
            It.Is<string>(m => m.Contains("15 Oct 2026")),
            "Info",
            7), Times.Once);
    }

    [Fact]
    public async Task GetUserIdByItemIdAsync_PassesThrough()
    {
        _borrowRepo.Setup(r => r.GetUserIdByItemIdAsync(7)).ReturnsAsync(3);

        var userId = await CreateService().GetUserIdByItemIdAsync(7);
        Assert.Equal(3, userId);
    }
}