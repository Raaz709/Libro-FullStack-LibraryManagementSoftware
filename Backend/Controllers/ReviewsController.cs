using System.Security.Claims;
using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet("book/{bookId:int}")]
    public async Task<IActionResult> GetByBook(int bookId)
    {
        var reviews = await _reviewService.GetByBookIdAsync(bookId);
        var summary = await _reviewService.GetSummaryAsync(bookId);

        return Ok(ApiResponse<object>.SuccessResponse(
            new { reviews, summary },
            "Reviews retrieved successfully."
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse(
                "User identity could not be determined.",
                "USER_ID_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        try
        {
            var id = await _reviewService.CreateAsync(
                userId.Value,
                request.BookId,
                request.Rating,
                request.Comment);

            return Ok(ApiResponse<int>.SuccessResponse(
                id,
                "Review submitted successfully."
            ));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<object>.ErrorResponse(
                ex.Message,
                "REVIEW_CREATE_FAILED",
                HttpContext.TraceIdentifier
            ));
        }
    }

    [HttpPut("{reviewId:int}")]
    public async Task<IActionResult> Update(int reviewId, [FromBody] CreateReviewRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse(
                "User identity could not be determined.",
                "USER_ID_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        try
        {
            var updated = await _reviewService.UpdateAsync(
                userId.Value,
                reviewId,
                request.Rating,
                request.Comment);

            if (!updated)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(
                    "Review not found or you do not own it.",
                    "REVIEW_NOT_FOUND",
                    HttpContext.TraceIdentifier
                ));
            }

            return Ok(ApiResponse<object>.SuccessResponse(
                null!,
                "Review updated successfully."
            ));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                ex.Message,
                "REVIEW_UPDATE_FAILED",
                HttpContext.TraceIdentifier
            ));
        }
    }

    [HttpDelete("{reviewId:int}")]
    public async Task<IActionResult> Delete(int reviewId)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse(
                "User identity could not be determined.",
                "USER_ID_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        var isStaff = User.IsInRole("Admin") || User.IsInRole("Librarian");
        var deleted = await _reviewService.DeleteAsync(userId.Value, reviewId, isStaff);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Review not found or you do not have permission to delete it.",
                "REVIEW_DELETE_FAILED",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Review deleted successfully."
        ));
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }
}

public class CreateReviewRequest
{
    public int BookId { get; set; }
    public byte Rating { get; set; }
    public string? Comment { get; set; }
}