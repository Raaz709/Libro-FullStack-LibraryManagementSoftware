using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Library_Management.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BookCategoriesController : ControllerBase
{
    private readonly IBookCategoryService _bookCategoryService;

    public BookCategoriesController(IBookCategoryService bookCategoryService)
    {
        _bookCategoryService = bookCategoryService;
    }

    // All authenticated users can view categories assigned to a book
    [HttpGet("book/{bookId:int}")]
    public async Task<IActionResult> GetCategoriesByBookId(int bookId)
    {
        var categories =
            await _bookCategoryService.GetCategoriesByBookIdAsync(bookId);

        return Ok(ApiResponse<IEnumerable<Category>>.SuccessResponse(
            categories,
            "Book categories retrieved successfully."
        ));
    }

    // All authenticated users can view books in a category
    [HttpGet("category/{categoryId:int}")]
    public async Task<IActionResult> GetBooksByCategoryId(int categoryId)
    {
        var books =
            await _bookCategoryService.GetBooksByCategoryIdAsync(categoryId);

        return Ok(ApiResponse<IEnumerable<Book>>.SuccessResponse(
            books,
            "Books for category retrieved successfully."
        ));
    }

    // Only Librarian and Admin can assign categories
    [HttpPost("book/{bookId:int}/category/{categoryId:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> AssignCategory(
        int bookId,
        int categoryId)
    {
        var assigned =
            await _bookCategoryService.AssignCategoryAsync(
                bookId,
                categoryId);

        if (!assigned)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Failed to assign category to book.",
                "ASSIGN_FAILED",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Category assigned to book successfully."
        ));
    }

    // Only Librarian and Admin can remove categories
    [HttpDelete("book/{bookId:int}/category/{categoryId:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> RemoveCategory(
        int bookId,
        int categoryId)
    {
        var removed =
            await _bookCategoryService.RemoveCategoryAsync(
                bookId,
                categoryId);

        if (!removed)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Assignment not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Category removed from book successfully."
        ));
    }
}