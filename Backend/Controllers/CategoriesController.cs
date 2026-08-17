using Library_Management.Common;
using Library_Management.DTOs.Category;
using Library_Management.Models;
using Library_Management.Services;
using Library_Management.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    // All authenticated users can view categories
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryService.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<Category>>.SuccessResponse(
            categories,
            "Categories retrieved successfully."
        ));
    }

    // All authenticated users can view a category
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

    // Only Librarian and Admin can create categories
    [HttpPost]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateCategoryDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

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

    // Only Librarian and Admin can update categories
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateCategoryDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

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

    // Only Librarian and Admin can delete categories
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Librarian,Admin")]
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