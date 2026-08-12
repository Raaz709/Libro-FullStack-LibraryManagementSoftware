using Library_Management.Common;
using Library_Management.DTOs.Category;
using Library_Management.Models;
using Library_Management.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<Category>>.SuccessResponse(
            categories,
            "Categories retrieved successfully."
        ));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _categoryService.GetByIdAsync(id);

        if (category is null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Category not found.",
                "CATEGORY_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<Category>.SuccessResponse(
            category,
            "Category retrieved successfully."
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var createdCategory = await _categoryService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdCategory.Id },
            ApiResponse<Category>.SuccessResponse(
                createdCategory,
                "Category created successfully."
            )
        );
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var updated = await _categoryService.UpdateAsync(id, dto);

        if (!updated)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Category not found.",
                "CATEGORY_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        var category = await _categoryService.GetByIdAsync(id);

        return Ok(ApiResponse<Category>.SuccessResponse(
            category!,
            "Category updated successfully."
        ));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _categoryService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "Category not found.",
                "CATEGORY_NOT_FOUND",
                HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<object>.SuccessResponse(
            null!,
            "Category deleted successfully."
        ));
    }
}