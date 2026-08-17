using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Library_Management.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Library_Management.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BorrowTransactionsController : ControllerBase
{
    private readonly IBorrowTransactionService _borrowTransactionService;

    public BorrowTransactionsController(
        IBorrowTransactionService borrowTransactionService)
    {
        _borrowTransactionService = borrowTransactionService;
    }

    // -------------------------------------------------------------
    // GET ALL
    // -------------------------------------------------------------
    // Only Librarian and Admin can view all transactions.
    [HttpGet]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _borrowTransactionService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<BorrowTransaction>>.SuccessResponse(
            transactions,
            "Borrow transactions retrieved successfully."
        ));
    }

    // -------------------------------------------------------------
    // GET BY ID
    // -------------------------------------------------------------
    // Librarian/Admin can view any transaction.
    // Student/Faculty can view only their own transaction.
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var transaction = await _borrowTransactionService.GetByIdAsync(id);

        if (transaction is null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Borrow transaction not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        if (!IsStaff() && !IsCurrentUser(transaction.UserId))
        {
            return Forbid();
        }

        return Ok(ApiResponse<BorrowTransaction>.SuccessResponse(
            transaction,
            "Borrow transaction retrieved successfully."
        ));
    }

    // -------------------------------------------------------------
    // GET BY USER ID
    // -------------------------------------------------------------
    // Librarian/Admin can view any user's transactions.
    // Student/Faculty can only view their own transactions.
    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        if (!IsStaff() && !IsCurrentUser(userId))
        {
            return Forbid();
        }

        var transactions =
            await _borrowTransactionService.GetByUserIdAsync(userId);

        return Ok(ApiResponse<IEnumerable<BorrowTransaction>>.SuccessResponse(
            transactions,
            "User borrow transactions retrieved successfully."
        ));
    }

    // -------------------------------------------------------------
    // CREATE
    // -------------------------------------------------------------
    // Librarian/Admin can create for any user.
    // Student/Faculty can only create for themselves.
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] BorrowTransaction transaction)
    {
        if (!IsStaff() && !IsCurrentUser(transaction.UserId))
        {
            return Forbid();
        }

        var id = await _borrowTransactionService.CreateAsync(transaction);

        transaction.Id = id;

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            ApiResponse<BorrowTransaction>.SuccessResponse(
                transaction,
                "Borrow transaction created successfully."
            )
        );
    }

    // -------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------
    // Only Librarian/Admin can update transactions.
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] BorrowTransaction transaction)
    {
        transaction.Id = id;

        var updated =
            await _borrowTransactionService.UpdateAsync(transaction);

        if (!updated)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Borrow transaction not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Borrow transaction updated successfully."
        ));
    }

    // -------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------
    // Only Admin can delete transactions.
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted =
            await _borrowTransactionService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Borrow transaction not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Borrow transaction deleted successfully."
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