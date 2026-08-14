using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetFavoritesByUserId(int userId)
    {
        var favorites = await _favoriteService.GetFavoritesByUserIdAsync(userId);
        return Ok(ApiResponse<IEnumerable<Book>>.SuccessResponse(favorites, "User favorites retrieved successfully."));
    }

    [HttpGet("user/{userId:int}/book/{bookId:int}")]
    public async Task<IActionResult> IsFavorite(int userId, int bookId)
    {
        var isFav = await _favoriteService.IsFavoriteAsync(userId, bookId);
        return Ok(ApiResponse<bool>.SuccessResponse(isFav, "Favorite status checked successfully."));
    }

    [HttpPost("user/{userId:int}/book/{bookId:int}")]
    public async Task<IActionResult> AddFavorite(int userId, int bookId)
    {
        var added = await _favoriteService.AddFavoriteAsync(userId, bookId);
        if (!added) return BadRequest(ApiResponse<object>.ErrorResponse("Book is already in favorites or user/book does not exist.", "ADD_FAILED", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Book added to favorites successfully."));
    }

    [HttpDelete("user/{userId:int}/book/{bookId:int}")]
    public async Task<IActionResult> RemoveFavorite(int userId, int bookId)
    {
        var removed = await _favoriteService.RemoveFavoriteAsync(userId, bookId);
        if (!removed) return NotFound(ApiResponse<object>.ErrorResponse("Favorite entry not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Book removed from favorites successfully."));
    }
}