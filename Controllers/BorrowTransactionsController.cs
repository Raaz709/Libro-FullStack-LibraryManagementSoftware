using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BorrowTransactionsController : ControllerBase
{
    private readonly IBorrowTransactionService _borrowTransactionService;

    public BorrowTransactionsController(IBorrowTransactionService borrowTransactionService)
    {
        _borrowTransactionService = borrowTransactionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _borrowTransactionService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<BorrowTransaction>>.SuccessResponse(transactions, "Borrow transactions retrieved successfully."));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var transaction = await _borrowTransactionService.GetByIdAsync(id);
        if (transaction is null) return NotFound(ApiResponse<object>.ErrorResponse("Borrow transaction not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<BorrowTransaction>.SuccessResponse(transaction, "Borrow transaction retrieved successfully."));
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var transactions = await _borrowTransactionService.GetByUserIdAsync(userId);
        return Ok(ApiResponse<IEnumerable<BorrowTransaction>>.SuccessResponse(transactions, "User borrow transactions retrieved successfully."));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BorrowTransaction transaction)
    {
        var id = await _borrowTransactionService.CreateAsync(transaction);
        transaction.Id = id;
        return CreatedAtAction(nameof(GetById), new { id }, ApiResponse<BorrowTransaction>.SuccessResponse(transaction, "Borrow transaction created successfully."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] BorrowTransaction transaction)
    {
        transaction.Id = id;
        var updated = await _borrowTransactionService.UpdateAsync(transaction);
        if (!updated) return NotFound(ApiResponse<object>.ErrorResponse("Borrow transaction not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Borrow transaction updated successfully."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _borrowTransactionService.DeleteAsync(id);
        if (!deleted) return NotFound(ApiResponse<object>.ErrorResponse("Borrow transaction not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Borrow transaction deleted successfully."));
    }
}