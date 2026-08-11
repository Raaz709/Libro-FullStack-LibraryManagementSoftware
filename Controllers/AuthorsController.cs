using Library_Management.DTOs.Author;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthorsController : ControllerBase
{
    private readonly IAuthorService _authorService;

    public AuthorsController(IAuthorService authorService)
    {
        _authorService = authorService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Author>>> GetAll()
    {
        var authors = await _authorService.GetAllAsync();
        return Ok(authors);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Author>> GetById(int id)
    {
        var author = await _authorService.GetByIdAsync(id);
        if (author == null) return NotFound(new { message = $"Author with ID {id} not found." });

        return Ok(author);
    }

    [HttpPost]
    public async Task<ActionResult<Author>> Create([FromBody] CreateAuthorDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var createdAuthor = await _authorService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = createdAuthor.Id }, createdAuthor);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAuthorDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var updated = await _authorService.UpdateAsync(id, dto);
        if (!updated) return NotFound(new { message = $"Author with ID {id} not found." });

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _authorService.DeleteAsync(id);
        if (!deleted) return NotFound(new { message = $"Author with ID {id} not found." });

        return NoContent();
    }
}