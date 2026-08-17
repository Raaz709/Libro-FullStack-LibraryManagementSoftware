using Microsoft.AspNetCore.Authorization;
using Library_Management.Common;
using Library_Management.DTOs.Author;
using Library_Management.DTOs.Book;
using Library_Management.Models;
using Library_Management.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;
    private readonly IBookAuthorService _bookAuthorService;

    public BooksController(
        IBookService bookService,
        IBookAuthorService bookAuthorService)
    {
        _bookService = bookService;
        _bookAuthorService = bookAuthorService;
    }

    // -------------------------------------------------------------
    // BOOK CRUD ENDPOINTS
    // -------------------------------------------------------------

    // All authenticated users can view books
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var books = await _bookService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<BookResponse>>.SuccessResponse(
            books,
            "Books retrieved successfully."
        ));
    }

    // All authenticated users can view a specific book
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

    // Only Librarian and Admin can create books
    [HttpPost]
    [Authorize(Roles = "Librarian,Admin")]
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

    // Only Librarian and Admin can update books
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
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

    // Only Librarian and Admin can delete books
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
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

    // All authenticated users can view authors for a book
    [HttpGet("{bookId:int}/authors")]
    public async Task<IActionResult> GetBookAuthors(int bookId)
    {
        var authors =
            await _bookAuthorService.GetAuthorsForBookAsync(bookId);

        return Ok(ApiResponse<IEnumerable<Author>>.SuccessResponse(
            authors,
            "Authors for the book retrieved successfully."
        ));
    }

    // Only Librarian and Admin can assign an author
    [HttpPost("{bookId:int}/authors")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> AssignAuthor(
        int bookId,
        [FromBody] AssignAuthorDto dto)
    {
        var result =
            await _bookAuthorService.AssignAuthorAsync(bookId, dto);

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

    // Only Librarian and Admin can remove an author
    [HttpDelete("{bookId:int}/authors/{authorId:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> RemoveAuthor(
        int bookId,
        int authorId)
    {
        var result =
            await _bookAuthorService.RemoveAuthorAsync(
                bookId,
                authorId);

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