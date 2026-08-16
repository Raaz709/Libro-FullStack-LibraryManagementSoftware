using System.Security.Claims;
using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class ActivityLogsController : ControllerBase
{
    private readonly IActivityLogService _activityLogService;

    public ActivityLogsController(IActivityLogService activityLogService)
    {
        _activityLogService = activityLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var logs = await _activityLogService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<ActivityLog>>.SuccessResponse(
            logs,
            "Activity logs retrieved successfully."
        ));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var log = await _activityLogService.GetByIdAsync(id);

        if (log is null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Activity log not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<ActivityLog>.SuccessResponse(
            log,
            "Activity log retrieved successfully."
        ));
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var logs = await _activityLogService.GetByUserIdAsync(userId);

        return Ok(ApiResponse<IEnumerable<ActivityLog>>.SuccessResponse(
            logs,
            "User activity logs retrieved successfully."
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ActivityLog log)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (int.TryParse(userIdClaim, out var authenticatedUserId))
        {
            log.UserId = authenticatedUserId;
        }

        log.IpAddress ??= HttpContext.Connection.RemoteIpAddress?.ToString();
        log.UserAgent ??= HttpContext.Request.Headers["User-Agent"].ToString();

        var id = await _activityLogService.CreateAsync(log);
        log.Id = id;

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            ApiResponse<ActivityLog>.SuccessResponse(
                log,
                "Activity log recorded successfully."
            )
        );
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _activityLogService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Activity log not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Activity log deleted successfully."
        ));
    }
}