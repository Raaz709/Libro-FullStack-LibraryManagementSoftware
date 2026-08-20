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
public class SettingsController : ControllerBase
{
    private readonly ISettingService _settingService;

    public SettingsController(ISettingService settingService)
    {
        _settingService = settingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var settings = await _settingService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<Setting>>.SuccessResponse(
            settings,
            "Settings retrieved successfully."
        ));
    }

    [HttpPut("{key}")]
    public async Task<IActionResult> Upsert(string key, [FromBody] UpdateSettingRequest request)
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
            await _settingService.UpsertAsync(key, request.Value, request.Description, userId.Value);

            return Ok(ApiResponse<object>.SuccessResponse(
                null!,
                "Setting saved successfully."
            ));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                ex.Message,
                "SETTING_INVALID",
                HttpContext.TraceIdentifier
            ));
        }
    }

    [HttpDelete("{key}")]
    public async Task<IActionResult> Delete(string key)
    {
        var deleted = await _settingService.DeleteAsync(key);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Setting not found.",
                "SETTING_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Setting deleted successfully."
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

public class UpdateSettingRequest
{
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}