using Library_Management.Common;
using Library_Management.DTOs.Book;
using Library_Management.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var books = await _bookService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<BookResponse>>.SuccessResponse(
            books,
            "Books retrieved successfully."
        ));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var book = await _bookService.GetByIdAsync(id);

        if (book is null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Book not found.",
                "BOOK_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<BookResponse>.SuccessResponse(
            book,
            "Book retrieved successfully."
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateBookRequest request)
    {
        var book = await _bookService.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = book.Id },
            ApiResponse<BookResponse>.SuccessResponse(
                book,
                "Book created successfully."
            )
        );
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateBookRequest request)
    {
        var updated = await _bookService.UpdateAsync(id, request);

        if (!updated)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Book not found.",
                "BOOK_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        var book = await _bookService.GetByIdAsync(id);

        return Ok(ApiResponse<BookResponse>.SuccessResponse(
            book!,
            "Book updated successfully."
        ));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _bookService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Book not found.",
                "BOOK_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Book deleted successfully."
        ));
    }
}
