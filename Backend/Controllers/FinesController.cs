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
public class FinesController : ControllerBase
{
    private readonly IFineService _fineService;

    public FinesController(IFineService fineService)
    {
        _fineService = fineService;
    }

    // -------------------------------------------------------------
    // GET ALL
    // -------------------------------------------------------------
    // Only Librarian and Admin can view all fines.
    [HttpGet]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> GetAll()
    {
        var fines = await _fineService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<Fine>>.SuccessResponse(
            fines,
            "Fines retrieved successfully."
        ));
    }

    // -------------------------------------------------------------
    // GET BY ID
    // -------------------------------------------------------------
    // Students/Faculty can only view their own fine.
    // Librarian/Admin can view any fine.
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var fine = await _fineService.GetByIdAsync(id);

        if (fine is null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Fine not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        if (!IsStaff() && !IsCurrentUser(fine.UserId))
        {
            return Forbid();
        }

        return Ok(ApiResponse<Fine>.SuccessResponse(
            fine,
            "Fine retrieved successfully."
        ));
    }

    // -------------------------------------------------------------
    // GET BY USER ID
    // -------------------------------------------------------------
    // Students/Faculty can only view their own fines.
    // Librarian/Admin can view any user's fines.
    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        if (!IsStaff() && !IsCurrentUser(userId))
        {
            return Forbid();
        }

        var fines = await _fineService.GetByUserIdAsync(userId);

        return Ok(ApiResponse<IEnumerable<Fine>>.SuccessResponse(
            fines,
            "User fines retrieved successfully."
        ));
    }

    // -------------------------------------------------------------
    // GET UNPAID FINES BY USER ID
    // -------------------------------------------------------------
    [HttpGet("user/{userId:int}/unpaid")]
    public async Task<IActionResult> GetUnpaidByUserId(int userId)
    {
        if (!IsStaff() && !IsCurrentUser(userId))
        {
            return Forbid();
        }

        var fines = await _fineService.GetUnpaidByUserIdAsync(userId);

        return Ok(ApiResponse<IEnumerable<Fine>>.SuccessResponse(
            fines,
            "Unpaid user fines retrieved successfully."
        ));
    }

    // -------------------------------------------------------------
    // CREATE
    // -------------------------------------------------------------
    // Only Librarian and Admin can create fines.
    [HttpPost]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Create([FromBody] Fine fine)
    {
        var id = await _fineService.CreateAsync(fine);

        fine.Id = id;

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            ApiResponse<Fine>.SuccessResponse(
                fine,
                "Fine created successfully."
            )
        );
    }

    // -------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------
    // Only Librarian and Admin can update fines.
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] Fine fine)
    {
        fine.Id = id;

        var updated = await _fineService.UpdateAsync(fine);

        if (!updated)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Fine not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Fine updated successfully."
        ));
    }

    // -------------------------------------------------------------
    // WAIVE FINE
    // -------------------------------------------------------------
    // Only Admin can waive fines.
    // The waived-by user ID comes from the authenticated JWT,
    // NOT from the request body.
    [HttpPut("{id:int}/waive")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> WaiveFine(int id)
    {
        var currentUserId =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(currentUserId, out var waivedByUserId))
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse(
                "Unable to determine the authenticated user.",
                "INVALID_USER_CLAIM",
                HttpContext.TraceIdentifier
            ));
        }

        var waived = await _fineService.WaiveFineAsync(
            id,
            waivedByUserId
        );

        if (!waived)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Fine not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Fine waived successfully."
        ));
    }

    // -------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------
    // Only Admin can delete fines.
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _fineService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Fine not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Fine deleted successfully."
        ));
    }

    // -------------------------------------------------------------
    // AUTHORIZATION HELPERS
    // -------------------------------------------------------------

    private bool IsStaff()
    {
        return User.IsInRole("Librarian") ||
               User.IsInRole("Admin");
    }

    private bool IsCurrentUser(int userId)
    {
        var currentUserId =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(currentUserId, out var id) &&
               id == userId;
    }
}