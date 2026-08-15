using Library_Management.DTOs.Publisher;
using Library_Management.Models;
using Library_Management.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PublishersController : ControllerBase
{
    private readonly IPublisherService _publisherService;

    public PublishersController(IPublisherService publisherService)
    {
        _publisherService = publisherService;
    }

    /// <summary>
    /// Get all publishers
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Publisher>))]
    public async Task<IActionResult> GetAll()
    {
        var publishers = await _publisherService.GetAllAsync();

        return Ok(publishers);
    }

    /// <summary>
    /// Get publisher by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Publisher))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var publisher = await _publisherService.GetByIdAsync(id);

        if (publisher == null)
        {
            return NotFound(new
            {
                message = $"Publisher with ID {id} not found."
            });
        }

        return Ok(publisher);
    }

    /// <summary>
    /// Create a new publisher
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Librarian,Admin")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Publisher))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreatePublisherDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var createdPublisher = await _publisherService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdPublisher.Id },
            createdPublisher);
    }

    /// <summary>
    /// Update an existing publisher
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdatePublisherDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await _publisherService.UpdateAsync(id, dto);

        if (!updated)
        {
            return NotFound(new
            {
                message = $"Publisher with ID {id} not found."
            });
        }

        return NoContent();
    }

    /// <summary>
    /// Delete a publisher
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _publisherService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message = $"Publisher with ID {id} not found."
            });
        }

        return NoContent();
    }
}