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
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyReservations()
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

        var reservations = await _reservationService.GetByUserIdAsync(userId.Value);

        return Ok(ApiResponse<IEnumerable<Reservation>>.SuccessResponse(
            reservations,
            "Reservations retrieved successfully."
        ));
    }

    [Authorize(Roles = "Librarian,Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var reservations = await _reservationService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<Reservation>>.SuccessResponse(
            reservations,
            "Reservations retrieved successfully."
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReservationRequest request)
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
            var id = await _reservationService.CreateAsync(userId.Value, request.BookId);

            return Ok(ApiResponse<int>.SuccessResponse(
                id,
                "Reservation placed successfully."
            ));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<object>.ErrorResponse(
                ex.Message,
                "RESERVATION_CREATE_FAILED",
                HttpContext.TraceIdentifier
            ));
        }
    }

    [HttpPost("{reservationId:int}/cancel")]
    public async Task<IActionResult> Cancel(int reservationId)
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
        var cancelled = await _reservationService.CancelAsync(userId.Value, reservationId, isStaff);

        if (!cancelled)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Reservation not found, or it can no longer be cancelled.",
                "RESERVATION_CANCEL_FAILED",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Reservation cancelled successfully."
        ));
    }

    [Authorize(Roles = "Librarian,Admin")]
    [HttpPost("{reservationId:int}/fulfill")]
    public async Task<IActionResult> Fulfill(int reservationId)
    {
        var fulfilled = await _reservationService.FulfillAsync(reservationId);

        if (!fulfilled)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Reservation not found or it is no longer waiting.",
                "RESERVATION_FULFILL_FAILED",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Reservation fulfilled successfully."
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

public class CreateReservationRequest
{
    public int BookId { get; set; }
}