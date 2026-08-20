using Library_Management.Repositories;
using Library_Management.Services;

namespace Library_Management.Services;

public sealed class OverdueNotificationService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OverdueNotificationService> _logger;
    private readonly TimeSpan _interval;

    public OverdueNotificationService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<OverdueNotificationService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        var minutes = configuration.GetValue<int>("Notifications:OverdueIntervalMinutes", 5);
        _interval = TimeSpan.FromMinutes(Math.Max(1, minutes));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Overdue notification service started (interval: {Interval}).", _interval);

        using var timer = new PeriodicTimer(_interval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await NotifyOverdueItemsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process overdue notifications.");
            }
        }
    }

    private async Task NotifyOverdueItemsAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var borrowItemRepository = scope.ServiceProvider.GetRequiredService<IBorrowItemRepository>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var overdueItems = await borrowItemRepository.GetOverdueItemsAsync();
        foreach (var item in overdueItems)
        {
            stoppingToken.ThrowIfCancellationRequested();

            if (await notificationService.ExistsByTypeAndReferenceAsync("Overdue", item.Id))
            {
                continue;
            }

            var context = await borrowItemRepository.GetNotificationContextByItemIdAsync(item.Id);
            if (context is null)
            {
                continue;
            }

            await notificationService.NotifyAsync(
                context.UserId,
                $"Overdue: {context.BookTitle}",
                $"This book is overdue. It was due on {item.DueDate:dd MMM yyyy}. Please return it to the library.",
                "Overdue",
                item.Id);
        }
    }
}