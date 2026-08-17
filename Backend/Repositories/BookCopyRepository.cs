using Dapper;
using Library_Management.Data;
using Library_Management.Models;

namespace Library_Management.Repositories;

public class BookCopyRepository : IBookCopyRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public BookCopyRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<BookCopy>> GetAllAsync()
    {
        const string sql = @"
            SELECT Id, BookId, ShelfId, Barcode, QRCode, ConditionStatus, Status, PurchaseDate, Price, CreatedAt, UpdatedAt
            FROM bookcopies
            ORDER BY Id DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<BookCopy>(sql);
    }

    public async Task<IEnumerable<BookCopy>> GetByBookIdAsync(int bookId)
    {
        const string sql = @"
            SELECT Id, BookId, ShelfId, Barcode, QRCode, ConditionStatus, Status, PurchaseDate, Price, CreatedAt, UpdatedAt
            FROM bookcopies
            WHERE BookId = @BookId;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<BookCopy>(sql, new { BookId = bookId });
    }

    public async Task<BookCopy?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, BookId, ShelfId, Barcode, QRCode, ConditionStatus, Status, PurchaseDate, Price, CreatedAt, UpdatedAt
            FROM bookcopies
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<BookCopy>(sql, new { Id = id });
    }

    public async Task<BookCopy?> GetByBarcodeAsync(string barcode)
    {
        const string sql = @"
            SELECT Id, BookId, ShelfId, Barcode, QRCode, ConditionStatus, Status, PurchaseDate, Price, CreatedAt, UpdatedAt
            FROM bookcopies
            WHERE Barcode = @Barcode;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<BookCopy>(sql, new { Barcode = barcode });
    }

    public async Task<int> CreateAsync(BookCopy bookCopy)
    {
        const string sql = @"
            INSERT INTO bookcopies (BookId, ShelfId, Barcode, QRCode, ConditionStatus, Status, PurchaseDate, Price, CreatedAt, UpdatedAt)
            VALUES (@BookId, @ShelfId, @Barcode, @QRCode, @ConditionStatus, @Status, @PurchaseDate, @Price, NOW(), NOW());
            SELECT LAST_INSERT_ID();";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, bookCopy);
    }

    public async Task<bool> UpdateAsync(BookCopy bookCopy)
    {
        const string sql = @"
            UPDATE bookcopies
            SET ShelfId = @ShelfId,
                Barcode = @Barcode,
                QRCode = @QRCode,
                ConditionStatus = @ConditionStatus,
                Status = @Status,
                PurchaseDate = @PurchaseDate,
                Price = @Price,
                UpdatedAt = NOW()
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, bookCopy);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM bookcopies WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}