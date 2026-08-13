using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookCopiesController : ControllerBase
{
    private readonly IBookCopyService _bookCopyService;

    public BookCopiesController(IBookCopyService bookCopyService)
    {
        _bookCopyService = bookCopyService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var copies = await _bookCopyService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<BookCopy>>.SuccessResponse(copies, "Book copies retrieved successfully."));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var copy = await _bookCopyService.GetByIdAsync(id);
        if (copy is null) return NotFound(ApiResponse<object>.ErrorResponse("Book copy not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<BookCopy>.SuccessResponse(copy, "Book copy retrieved successfully."));
    }

    [HttpGet("book/{bookId:int}")]
    public async Task<IActionResult> GetByBookId(int bookId)
    {
        var copies = await _bookCopyService.GetByBookIdAsync(bookId);
        return Ok(ApiResponse<IEnumerable<BookCopy>>.SuccessResponse(copies, "Book copies retrieved successfully."));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BookCopy bookCopy)
    {
        var id = await _bookCopyService.CreateAsync(bookCopy);
        bookCopy.Id = id;
        return CreatedAtAction(nameof(GetById), new { id }, ApiResponse<BookCopy>.SuccessResponse(bookCopy, "Book copy created successfully."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] BookCopy bookCopy)
    {
        bookCopy.Id = id;
        var updated = await _bookCopyService.UpdateAsync(bookCopy);
        if (!updated) return NotFound(ApiResponse<object>.ErrorResponse("Book copy not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Book copy updated successfully."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _bookCopyService.DeleteAsync(id);
        if (!deleted) return NotFound(ApiResponse<object>.ErrorResponse("Book copy not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Book copy deleted successfully."));
    }
}