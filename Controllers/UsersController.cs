using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<User>>.SuccessResponse(users, "Users retrieved successfully."));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user is null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("User not found.", "USER_NOT_FOUND", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<User>.SuccessResponse(user, "User retrieved successfully."));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] User user)
    {
        var newId = await _userService.CreateAsync(user);
        user.Id = newId;

        return CreatedAtAction(nameof(GetById), new { id = newId }, ApiResponse<User>.SuccessResponse(user, "User created successfully."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] User user)
    {
        user.Id = id;
        var updated = await _userService.UpdateAsync(user);
        if (!updated)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("User not found.", "USER_NOT_FOUND", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<object>.SuccessResponse(null!, "User updated successfully."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _userService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("User not found.", "USER_NOT_FOUND", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<object>.SuccessResponse(null!, "User deleted successfully."));
    }
}