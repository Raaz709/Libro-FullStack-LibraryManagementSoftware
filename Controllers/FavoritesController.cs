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
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyFavorites()
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

        var favorites = await _favoriteService.GetFavoritesByUserIdAsync(userId.Value);

        return Ok(ApiResponse<IEnumerable<Book>>.SuccessResponse(
            favorites,
            "Favorites retrieved successfully."
        ));
    }

    [HttpGet("book/{bookId:int}")]
    public async Task<IActionResult> IsFavorite(int bookId)
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

        var isFavorite = await _favoriteService.IsFavoriteAsync(
            userId.Value,
            bookId
        );

        return Ok(ApiResponse<bool>.SuccessResponse(
            isFavorite,
            "Favorite status checked successfully."
        ));
    }

    [HttpPost("book/{bookId:int}")]
    public async Task<IActionResult> AddFavorite(int bookId)
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

        var added = await _favoriteService.AddFavoriteAsync(
            userId.Value,
            bookId
        );

        if (!added)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Book is already in favorites or the book does not exist.",
                "ADD_FAVORITE_FAILED",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Book added to favorites successfully."
        ));
    }

    [HttpDelete("book/{bookId:int}")]
    public async Task<IActionResult> RemoveFavorite(int bookId)
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

        var removed = await _favoriteService.RemoveFavoriteAsync(
            userId.Value,
            bookId
        );

        if (!removed)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Favorite entry not found.",
                "FAVORITE_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Book removed from favorites successfully."
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

