using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IReservationRepository
{
    Task<IEnumerable<Reservation>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Reservation>> GetAllAsync();
    Task<Reservation?> GetByIdAsync(int id);
    Task<Reservation?> GetActiveByUserBookAsync(int userId, int bookId);
    Task<bool> HasAvailableCopiesAsync(int bookId);
    Task<int> CreateAsync(Reservation reservation);
    Task<bool> FulfillAsync(int id);
    Task<bool> CancelAsync(int id);
    Task<bool> DeleteAsync(int id);
}