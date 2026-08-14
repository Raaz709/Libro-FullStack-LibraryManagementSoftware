using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var payments = await _paymentService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<Payment>>.SuccessResponse(payments, "Payments retrieved successfully."));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var payment = await _paymentService.GetByIdAsync(id);
        if (payment is null) return NotFound(ApiResponse<object>.ErrorResponse("Payment record not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<Payment>.SuccessResponse(payment, "Payment record retrieved successfully."));
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var payments = await _paymentService.GetByUserIdAsync(userId);
        return Ok(ApiResponse<IEnumerable<Payment>>.SuccessResponse(payments, "User payment history retrieved successfully."));
    }

    [HttpGet("fine/{fineId:int}")]
    public async Task<IActionResult> GetByFineId(int fineId)
    {
        var payments = await _paymentService.GetByFineIdAsync(fineId);
        return Ok(ApiResponse<IEnumerable<Payment>>.SuccessResponse(payments, "Fine payment history retrieved successfully."));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Payment payment)
    {
        var id = await _paymentService.CreateAsync(payment);
        payment.Id = id;
        return CreatedAtAction(nameof(GetById), new { id }, ApiResponse<Payment>.SuccessResponse(payment, "Payment processed successfully."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _paymentService.DeleteAsync(id);
        if (!deleted) return NotFound(ApiResponse<object>.ErrorResponse("Payment record not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Payment record deleted successfully."));
    }
}