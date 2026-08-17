using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Library_Management.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    // Only Librarian and Admin can view all users
    [HttpGet]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<User>>.SuccessResponse(
            users,
            "Users retrieved successfully."
        ));
    }

    // Only Librarian and Admin can view a user
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);

        if (user is null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "User not found.",
                "USER_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<User>.SuccessResponse(
            user,
            "User retrieved successfully."
        ));
    }

    // Only Librarian and Admin can create users
    [HttpPost]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Create([FromBody] User user)
    {
        var newId = await _userService.CreateAsync(user);
        user.Id = newId;

        return CreatedAtAction(
            nameof(GetById),
            new { id = newId },
            ApiResponse<User>.SuccessResponse(
                user,
                "User created successfully."
            )
        );
    }

    // Only Librarian and Admin can update users
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] User user)
    {
        user.Id = id;

        var updated = await _userService.UpdateAsync(user);

        if (!updated)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "User not found.",
                "USER_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "User updated successfully."
        ));
    }

    // Only Admin can delete users
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _userService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "User not found.",
                "USER_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "User deleted successfully."
        ));
    }
}