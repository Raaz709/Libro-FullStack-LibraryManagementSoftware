using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;

    public PermissionsController(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var permissions = await _permissionService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<Permission>>.SuccessResponse(
            permissions,
            "Permissions retrieved successfully."
        ));
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _permissionService.GetRolesAsync();

        return Ok(ApiResponse<IEnumerable<RoleInfo>>.SuccessResponse(
            roles,
            "Roles retrieved successfully."
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePermissionRequest request)
    {
        try
        {
            var id = await _permissionService.CreateAsync(request.Name, request.Description);

            return Ok(ApiResponse<int>.SuccessResponse(
                id,
                "Permission created successfully."
            ));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                ex.Message,
                "PERMISSION_INVALID",
                HttpContext.TraceIdentifier
            ));
        }
    }

    [HttpPut("{permissionId:int}")]
    public async Task<IActionResult> Update(int permissionId, [FromBody] CreatePermissionRequest request)
    {
        try
        {
            var updated = await _permissionService.UpdateAsync(permissionId, request.Name, request.Description);

            if (!updated)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(
                    "Permission not found.",
                    "PERMISSION_NOT_FOUND",
                    HttpContext.TraceIdentifier
                ));
            }

            return Ok(ApiResponse<object>.SuccessResponse(
                null!,
                "Permission updated successfully."
            ));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                ex.Message,
                "PERMISSION_INVALID",
                HttpContext.TraceIdentifier
            ));
        }
    }

    [HttpDelete("{permissionId:int}")]
    public async Task<IActionResult> Delete(int permissionId)
    {
        var deleted = await _permissionService.DeleteAsync(permissionId);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Permission not found.",
                "PERMISSION_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Permission deleted successfully."
        ));
    }

    [HttpPost("assign")]
    public async Task<IActionResult> Assign([FromBody] RolePermissionRequest request)
    {
        var assigned = await _permissionService.AssignAsync(request.RoleId, request.PermissionId);

        if (!assigned)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Permission may already be assigned to this role.",
                "PERMISSION_ASSIGN_FAILED",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Permission assigned successfully."
        ));
    }

    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke([FromBody] RolePermissionRequest request)
    {
        var revoked = await _permissionService.RevokeAsync(request.RoleId, request.PermissionId);

        if (!revoked)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Assignment not found.",
                "PERMISSION_REVOKE_FAILED",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Permission revoked successfully."
        ));
    }
}

public class CreatePermissionRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class RolePermissionRequest
{
    public int RoleId { get; set; }
    public int PermissionId { get; set; }
}