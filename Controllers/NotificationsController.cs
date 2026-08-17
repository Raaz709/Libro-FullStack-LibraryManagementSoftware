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
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
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

        var notifications = await _notificationService.GetByUserIdAsync(userId.Value);

        return Ok(ApiResponse<IEnumerable<Notification>>.SuccessResponse(
            notifications,
            "Notifications retrieved successfully."
        ));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
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

        var notification = await _notificationService.GetByIdAsync(id);

        if (notification is null || notification.UserId != userId.Value)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Notification not found.",
                "NOTIFICATION_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<Notification>.SuccessResponse(
            notification,
            "Notification retrieved successfully."
        ));
    }

    [HttpGet("unread")]
    public async Task<IActionResult> GetUnread()
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

        var notifications =
            await _notificationService.GetUnreadByUserIdAsync(userId.Value);

        return Ok(ApiResponse<IEnumerable<Notification>>.SuccessResponse(
            notifications,
            "Unread notifications retrieved successfully."
        ));
    }

    [HttpPost]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Create(
        [FromBody] Notification notification)
    {
        var id = await _notificationService.CreateAsync(notification);
        notification.Id = id;

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            ApiResponse<Notification>.SuccessResponse(
                notification,
                "Notification created successfully."
            )
        );
    }

    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
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

        var notification = await _notificationService.GetByIdAsync(id);

        if (notification is null || notification.UserId != userId.Value)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Notification not found.",
                "NOTIFICATION_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        var updated = await _notificationService.MarkAsReadAsync(id);

        if (!updated)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Notification not found.",
                "NOTIFICATION_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Notification marked as read."
        ));
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
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

        await _notificationService.MarkAllAsReadByUserIdAsync(userId.Value);

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "All notifications marked as read."
        ));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _notificationService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Notification not found.",
                "NOTIFICATION_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Notification deleted successfully."
        ));
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(userIdClaim, out var userId)
            ? userId
            : null;
    }
}
