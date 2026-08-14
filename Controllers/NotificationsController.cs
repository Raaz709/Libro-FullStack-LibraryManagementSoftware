using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

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
    public async Task<IActionResult> GetAll()
    {
        var notifications = await _notificationService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<Notification>>.SuccessResponse(notifications, "Notifications retrieved successfully."));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var notification = await _notificationService.GetByIdAsync(id);
        if (notification is null) return NotFound(ApiResponse<object>.ErrorResponse("Notification not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<Notification>.SuccessResponse(notification, "Notification retrieved successfully."));
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var notifications = await _notificationService.GetByUserIdAsync(userId);
        return Ok(ApiResponse<IEnumerable<Notification>>.SuccessResponse(notifications, "User notifications retrieved successfully."));
    }

    [HttpGet("user/{userId:int}/unread")]
    public async Task<IActionResult> GetUnreadByUserId(int userId)
    {
        var notifications = await _notificationService.GetUnreadByUserIdAsync(userId);
        return Ok(ApiResponse<IEnumerable<Notification>>.SuccessResponse(notifications, "Unread notifications retrieved successfully."));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Notification notification)
    {
        var id = await _notificationService.CreateAsync(notification);
        notification.Id = id;
        return CreatedAtAction(nameof(GetById), new { id }, ApiResponse<Notification>.SuccessResponse(notification, "Notification created successfully."));
    }

    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var updated = await _notificationService.MarkAsReadAsync(id);
        if (!updated) return NotFound(ApiResponse<object>.ErrorResponse("Notification not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Notification marked as read."));
    }

    [HttpPut("user/{userId:int}/read-all")]
    public async Task<IActionResult> MarkAllAsReadByUserId(int userId)
    {
        await _notificationService.MarkAllAsReadByUserIdAsync(userId);
        return Ok(ApiResponse<object>.SuccessResponse(null!, "All user notifications marked as read."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _notificationService.DeleteAsync(id);
        if (!deleted) return NotFound(ApiResponse<object>.ErrorResponse("Notification not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Notification deleted successfully."));
    }
}