using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BorrowItemsController : ControllerBase
{
    private readonly IBorrowItemService _borrowItemService;

    public BorrowItemsController(IBorrowItemService borrowItemService)
    {
        _borrowItemService = borrowItemService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _borrowItemService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<BorrowItem>>.SuccessResponse(items, "Borrow items retrieved successfully."));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _borrowItemService.GetByIdAsync(id);
        if (item is null) return NotFound(ApiResponse<object>.ErrorResponse("Borrow item not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<BorrowItem>.SuccessResponse(item, "Borrow item retrieved successfully."));
    }

    [HttpGet("transaction/{transactionId:int}")]
    public async Task<IActionResult> GetByTransactionId(int transactionId)
    {
        var items = await _borrowItemService.GetByTransactionIdAsync(transactionId);
        return Ok(ApiResponse<IEnumerable<BorrowItem>>.SuccessResponse(items, "Transaction items retrieved successfully."));
    }

    [HttpGet("overdue")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> GetOverdueItems()
    {
        var items = await _borrowItemService.GetOverdueItemsAsync();
        return Ok(ApiResponse<IEnumerable<BorrowItem>>.SuccessResponse(items, "Overdue items retrieved successfully."));
    }

    [HttpPost]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Create([FromBody] BorrowItem item)
    {
        var id = await _borrowItemService.CreateAsync(item);
        item.Id = id;
        return CreatedAtAction(nameof(GetById), new { id }, ApiResponse<BorrowItem>.SuccessResponse(item, "Borrow item created successfully."));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] BorrowItem item)
    {
        item.Id = id;
        var updated = await _borrowItemService.UpdateAsync(item);
        if (!updated) return NotFound(ApiResponse<object>.ErrorResponse("Borrow item not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Borrow item updated successfully."));
    }

    [HttpPut("{id:int}/return")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> ReturnItem(int id, [FromBody] string? conditionAtReturn)
    {
        var returned = await _borrowItemService.ReturnItemAsync(id, conditionAtReturn);
        if (!returned) return NotFound(ApiResponse<object>.ErrorResponse("Borrow item not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Item marked as returned successfully."));
    }

    [HttpPut("{id:int}/renew")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> RenewItem(int id, [FromBody] DateTime newDueDate)
    {
        var renewed = await _borrowItemService.RenewItemAsync(id, newDueDate);
        if (!renewed) return NotFound(ApiResponse<object>.ErrorResponse("Borrow item not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Item renewed successfully."));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _borrowItemService.DeleteAsync(id);
        if (!deleted) return NotFound(ApiResponse<object>.ErrorResponse("Borrow item not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Borrow item deleted successfully."));
    }
}