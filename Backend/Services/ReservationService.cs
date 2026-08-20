using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public interface IReservationService
{
    Task<IEnumerable<Reservation>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Reservation>> GetAllAsync();
    Task<int> CreateAsync(int userId, int bookId);
    Task<bool> CancelAsync(int userId, int reservationId, bool isStaff);
    Task<bool> FulfillAsync(int reservationId);
}

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly INotificationService _notificationService;

    public ReservationService(
        IReservationRepository reservationRepository,
        INotificationService notificationService)
    {
        _reservationRepository = reservationRepository;
        _notificationService = notificationService;
    }

    public async Task<IEnumerable<Reservation>> GetByUserIdAsync(int userId) =>
        await _reservationRepository.GetByUserIdAsync(userId);

    public async Task<IEnumerable<Reservation>> GetAllAsync() =>
        await _reservationRepository.GetAllAsync();

    public async Task<int> CreateAsync(int userId, int bookId)
    {
        var existing = await _reservationRepository.GetActiveByUserBookAsync(userId, bookId);
        if (existing is not null)
        {
            throw new InvalidOperationException("You already have an active reservation for this book.");
        }

        var reservation = new Reservation
        {
            UserId = userId,
            BookId = bookId,
            Status = "Waiting",
            ExpiresAt = DateTime.UtcNow.AddDays(3)
        };

        var id = await _reservationRepository.CreateAsync(reservation);

        if (id > 0)
        {
            await _notificationService.NotifyAsync(
                userId,
                "Reservation placed",
                $"Your reservation for book #{bookId} has been placed. A copy will be held when available.",
                "Info",
                id);
        }

        return id;
    }

    public async Task<bool> CancelAsync(int userId, int reservationId, bool isStaff)
    {
        var existing = await _reservationRepository.GetByIdAsync(reservationId);
        if (existing is null)
        {
            return false;
        }

        if (!isStaff && existing.UserId != userId)
        {
            return false;
        }

        return await _reservationRepository.CancelAsync(reservationId);
    }

    public async Task<bool> FulfillAsync(int reservationId)
    {
        return await _reservationRepository.FulfillAsync(reservationId);
    }
}