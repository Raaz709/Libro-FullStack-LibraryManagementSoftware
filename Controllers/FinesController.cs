using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinesController : ControllerBase
{
    private readonly IFineService _fineService;

    public FinesController(IFineService fineService)
    {
        _fineService = fineService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var fines = await _fineService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<Fine>>.SuccessResponse(fines, "Fines retrieved successfully."));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var fine = await _fineService.GetByIdAsync(id);
        if (fine is null) return NotFound(ApiResponse<object>.ErrorResponse("Fine not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<Fine>.SuccessResponse(fine, "Fine retrieved successfully."));
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var fines = await _fineService.GetByUserIdAsync(userId);
        return Ok(ApiResponse<IEnumerable<Fine>>.SuccessResponse(fines, "User fines retrieved successfully."));
    }

    [HttpGet("user/{userId:int}/unpaid")]
    public async Task<IActionResult> GetUnpaidByUserId(int userId)
    {
        var fines = await _fineService.GetUnpaidByUserIdAsync(userId);
        return Ok(ApiResponse<IEnumerable<Fine>>.SuccessResponse(fines, "Unpaid user fines retrieved successfully."));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Fine fine)
    {
        var id = await _fineService.CreateAsync(fine);
        fine.Id = id;
        return CreatedAtAction(nameof(GetById), new { id }, ApiResponse<Fine>.SuccessResponse(fine, "Fine created successfully."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Fine fine)
    {
        fine.Id = id;
        var updated = await _fineService.UpdateAsync(fine);
        if (!updated) return NotFound(ApiResponse<object>.ErrorResponse("Fine not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Fine updated successfully."));
    }

    [HttpPut("{id:int}/waive")]
    public async Task<IActionResult> WaiveFine(int id, [FromBody] int waivedByUserId)
    {
        var waived = await _fineService.WaiveFineAsync(id, waivedByUserId);
        if (!waived) return NotFound(ApiResponse<object>.ErrorResponse("Fine not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Fine waived successfully."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _fineService.DeleteAsync(id);
        if (!deleted) return NotFound(ApiResponse<object>.ErrorResponse("Fine not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Fine deleted successfully."));
    }
}