using Library_Management.Models;

namespace Library_Management.Repositories;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllAsync();
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<int> CreateAsync(User member);
    Task<bool> UpdateAsync(User member);
    Task<bool> DeleteAsync(int id);
}