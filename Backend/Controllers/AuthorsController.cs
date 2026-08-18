using Library_Management.Common;
using Library_Management.DTOs.Author;
using Library_Management.Models;
using Library_Management.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AuthorsController : ControllerBase
{
    private readonly IAuthorService _authorService;

    public AuthorsController(IAuthorService authorService)
    {
        _authorService = authorService;
    }

    // All authenticated users can view authors
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var authors = await _authorService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<Author>>.SuccessResponse(
            authors,
            "Authors retrieved successfully."
        ));
    }

    // All authenticated users can view an author
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var author = await _authorService.GetByIdAsync(id);

        if (author is null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Author not found.",
                "AUTHOR_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<Author>.SuccessResponse(
            author,
            "Author retrieved successfully."
        ));
    }

    // Only Librarian and Admin can create authors
    [HttpPost]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateAuthorDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var createdAuthor = await _authorService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdAuthor.Id },
            ApiResponse<Author>.SuccessResponse(
                createdAuthor,
                "Author created successfully."
            ));
    }

    // Only Librarian and Admin can update authors
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateAuthorDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await _authorService.UpdateAsync(id, dto);

        if (!updated)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Author not found.",
                "AUTHOR_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            new { },
            "Author updated successfully."
        ));
    }

    // Only Librarian and Admin can delete authors
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _authorService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Author not found.",
                "AUTHOR_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            new { },
            "Author deleted successfully."
        ));
    }
}