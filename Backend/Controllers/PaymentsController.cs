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
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> GetAll()
    {
        var payments = await _paymentService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<Payment>>.SuccessResponse(
            payments,
            "Payments retrieved successfully."
        ));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var payment = await _paymentService.GetByIdAsync(id);

        if (payment is null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Payment record not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        if (!IsStaff() && !IsCurrentUser(payment.UserId))
        {
            return Forbid();
        }

        return Ok(ApiResponse<Payment>.SuccessResponse(
            payment,
            "Payment record retrieved successfully."
        ));
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        if (!IsStaff() && !IsCurrentUser(userId))
        {
            return Forbid();
        }

        var payments = await _paymentService.GetByUserIdAsync(userId);

        return Ok(ApiResponse<IEnumerable<Payment>>.SuccessResponse(
            payments,
            "User payment history retrieved successfully."
        ));
    }

    [HttpGet("fine/{fineId:int}")]
    public async Task<IActionResult> GetByFineId(int fineId)
    {
        var payments = await _paymentService.GetByFineIdAsync(fineId);

        if (!IsStaff())
        {
            if (!payments.Any())
            {
                return Ok(ApiResponse<IEnumerable<Payment>>.SuccessResponse(
                    payments,
                    "Fine payment history retrieved successfully."
                ));
            }

            if (payments.Any(p => !IsCurrentUser(p.UserId)))
            {
                return Forbid();
            }
        }

        return Ok(ApiResponse<IEnumerable<Payment>>.SuccessResponse(
            payments,
            "Fine payment history retrieved successfully."
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Payment payment)
    {
        var currentUserId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!int.TryParse(currentUserId, out var authenticatedUserId))
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse(
                "Unable to determine the authenticated user.",
                "INVALID_USER_CLAIM",
                HttpContext.TraceIdentifier
            ));
        }

        var id = await _paymentService.CreateAsync(
            payment,
            authenticatedUserId
        );

        if (id is null)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Payment must be for the user's own unpaid fine and must equal the full fine amount.",
                "INVALID_PAYMENT",
                HttpContext.TraceIdentifier
            ));
        }

        payment.Id = id.Value;
        payment.UserId = authenticatedUserId;

        return CreatedAtAction(
            nameof(GetById),
            new { id = payment.Id },
            ApiResponse<Payment>.SuccessResponse(
                payment,
                "Payment processed successfully."
            )
        );
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _paymentService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Payment record not found.",
                "NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Payment record deleted successfully."
        ));
    }

    private bool IsStaff()
    {
        return User.IsInRole("Librarian") ||
               User.IsInRole("Admin");
    }

    private bool IsCurrentUser(int userId)
    {
        var currentUserId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        return int.TryParse(currentUserId, out var id) &&
               id == userId;
    }
}