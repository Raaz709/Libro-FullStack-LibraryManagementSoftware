using Library_Management.Common;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailTemplatesController : ControllerBase
{
    private readonly IEmailTemplateService _emailTemplateService;

    public EmailTemplatesController(IEmailTemplateService emailTemplateService)
    {
        _emailTemplateService = emailTemplateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var templates = await _emailTemplateService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<EmailTemplate>>.SuccessResponse(templates, "Email templates retrieved successfully."));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var template = await _emailTemplateService.GetByIdAsync(id);
        if (template is null) return NotFound(ApiResponse<object>.ErrorResponse("Email template not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<EmailTemplate>.SuccessResponse(template, "Email template retrieved successfully."));
    }

    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetByCode(string code)
    {
        var template = await _emailTemplateService.GetByCodeAsync(code);
        if (template is null) return NotFound(ApiResponse<object>.ErrorResponse("Email template not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<EmailTemplate>.SuccessResponse(template, "Email template retrieved successfully."));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EmailTemplate template)
    {
        var id = await _emailTemplateService.CreateAsync(template);
        template.Id = id;
        return CreatedAtAction(nameof(GetById), new { id }, ApiResponse<EmailTemplate>.SuccessResponse(template, "Email template created successfully."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] EmailTemplate template)
    {
        template.Id = id;
        var updated = await _emailTemplateService.UpdateAsync(template);
        if (!updated) return NotFound(ApiResponse<object>.ErrorResponse("Email template not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Email template updated successfully."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _emailTemplateService.DeleteAsync(id);
        if (!deleted) return NotFound(ApiResponse<object>.ErrorResponse("Email template not found.", "NOT_FOUND", HttpContext.TraceIdentifier));
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Email template deleted successfully."));
    }
}