using Library_Management.Common;
using Library_Management.DTOs.Author;
using Library_Management.DTOs.Book;
using Library_Management.Models;
using Library_Management.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;
    private readonly IBookAuthorService _bookAuthorService;

    public BooksController(IBookService bookService, IBookAuthorService bookAuthorService)
    {
        _bookService = bookService;
        _bookAuthorService = bookAuthorService;
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
    public async Task<IActionResult> Create([FromBody] CreateBookRequest request)
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

    // -------------------------------------------------------------
    // BOOK - AUTHOR LINKING ENDPOINTS
    // -------------------------------------------------------------

    [HttpGet("{bookId:int}/authors")]
    public async Task<IActionResult> GetBookAuthors(int bookId)
    {
        var authors = await _bookAuthorService.GetAuthorsForBookAsync(bookId);

        return Ok(ApiResponse<IEnumerable<Author>>.SuccessResponse(
            authors,
            "Authors for the book retrieved successfully."
        ));
    }

    [HttpPost("{bookId:int}/authors")]
    public async Task<IActionResult> AssignAuthor(int bookId, [FromBody] AssignAuthorDto dto)
    {
        var result = await _bookAuthorService.AssignAuthorAsync(bookId, dto);

        if (!result)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Failed to assign author to book.",
                "ASSIGN_AUTHOR_FAILED",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Author assigned to book successfully."
        ));
    }

    [HttpDelete("{bookId:int}/authors/{authorId:int}")]
    public async Task<IActionResult> RemoveAuthor(int bookId, int authorId)
    {
        var result = await _bookAuthorService.RemoveAuthorAsync(bookId, authorId);

        if (!result)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Author assignment not found.",
                "AUTHOR_ASSIGNMENT_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Author removed from book successfully."
        ));
    }
}