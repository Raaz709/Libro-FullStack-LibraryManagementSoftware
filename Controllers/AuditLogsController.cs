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
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var logs = await _auditLogService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<AuditLog>>.SuccessResponse(
            logs,
            "Audit logs retrieved successfully."
        ));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var log = await _auditLogService.GetByIdAsync(id);

        if (log is null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Audit log not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<AuditLog>.SuccessResponse(
            log,
            "Audit log retrieved successfully."
        ));
    }

    [HttpGet("entity/{entityType}/{entityId:int}")]
    public async Task<IActionResult> GetByEntityType(
        string entityType,
        int entityId)
    {
        var logs = await _auditLogService.GetByEntityTypeAsync(
            entityType,
            entityId
        );

        return Ok(ApiResponse<IEnumerable<AuditLog>>.SuccessResponse(
            logs,
            "Entity audit logs retrieved successfully."
        ));
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var logs = await _auditLogService.GetByUserIdAsync(userId);

        return Ok(ApiResponse<IEnumerable<AuditLog>>.SuccessResponse(
            logs,
            "User audit logs retrieved successfully."
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AuditLog log)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (int.TryParse(userIdClaim, out var authenticatedUserId))
        {
            log.UserId = authenticatedUserId;
        }

        log.IpAddress ??= HttpContext.Connection.RemoteIpAddress?.ToString();
        log.UserAgent ??= HttpContext.Request.Headers["User-Agent"].ToString();

        var id = await _auditLogService.CreateAsync(log);
        log.Id = id;

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            ApiResponse<AuditLog>.SuccessResponse(
                log,
                "Audit log recorded successfully."
            )
        );
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _auditLogService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Audit log not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Audit log deleted successfully."
        ));
    }
}