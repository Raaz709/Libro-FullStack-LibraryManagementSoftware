using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public class BorrowItemService : IBorrowItemService
{
    private readonly IBorrowItemRepository _borrowItemRepository;
    private readonly INotificationService _notificationService;

    public BorrowItemService(
        IBorrowItemRepository borrowItemRepository,
        INotificationService notificationService)
    {
        _borrowItemRepository = borrowItemRepository;
        _notificationService = notificationService;
    }

    public async Task<int?> GetUserIdByItemIdAsync(int id)
    {
        return await _borrowItemRepository.GetUserIdByItemIdAsync(id);
    }

    public async Task<IEnumerable<BorrowItem>> GetAllAsync() => await _borrowItemRepository.GetAllAsync();
    public async Task<BorrowItem?> GetByIdAsync(int id) => await _borrowItemRepository.GetByIdAsync(id);
    public async Task<IEnumerable<BorrowItem>> GetByTransactionIdAsync(int transactionId) => await _borrowItemRepository.GetByTransactionIdAsync(transactionId);
    public async Task<IEnumerable<BorrowItem>> GetOverdueItemsAsync() => await _borrowItemRepository.GetOverdueItemsAsync();
    public async Task<bool> UpdateAsync(BorrowItem item) => await _borrowItemRepository.UpdateAsync(item);
    public async Task<bool> DeleteAsync(int id) => await _borrowItemRepository.DeleteAsync(id);

    public async Task<int> CreateAsync(BorrowItem item)
    {
        var id = await _borrowItemRepository.CreateAsync(item);
        await NotifyOnBorrowAsync(
            item.BorrowTransactionId,
            item.BookCopyId,
            id,
            $"You have borrowed this book. Due date: {item.DueDate:dd MMM yyyy}.");
        return id;
    }

    public async Task<bool> ReturnItemAsync(int id, string? conditionAtReturn)
    {
        var returned = await _borrowItemRepository.ReturnItemAsync(id, conditionAtReturn);
        if (returned)
        {
            await NotifyByItemIdAsync(
                id,
                "Returned",
                "The book you borrowed has been returned successfully.",
                "Info");
        }
        return returned;
    }

    public async Task<bool> RenewItemAsync(int id, DateTime newDueDate)
    {
        var renewed = await _borrowItemRepository.RenewItemAsync(id, newDueDate);
        if (renewed)
        {
            await NotifyByItemIdAsync(
                id,
                "Renewed",
                $"Your loan was renewed. New due date: {newDueDate:dd MMM yyyy}.",
                "Info");
        }
        return renewed;
    }

    private async Task NotifyOnBorrowAsync(int transactionId, int copyId, int itemId, string message)
    {
        var context = await _borrowItemRepository.GetNotificationContextAsync(transactionId, copyId);
        if (context is null)
        {
            return;
        }

        await _notificationService.NotifyAsync(
            context.UserId,
            $"Borrowed: {context.BookTitle}",
            message,
            "Info",
            itemId);
    }

    private async Task NotifyByItemIdAsync(int itemId, string action, string message, string type)
    {
        var context = await _borrowItemRepository.GetNotificationContextByItemIdAsync(itemId);
        if (context is null)
        {
            return;
        }

        await _notificationService.NotifyAsync(
            context.UserId,
            $"{action}: {context.BookTitle}",
            message,
            type,
            itemId);
    }
}