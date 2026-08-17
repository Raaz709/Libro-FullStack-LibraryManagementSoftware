using Dapper;
using Library_Management.Data;
using Microsoft.AspNetCore.Mvc;

namespace Library_Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IDbConnectionFactory _connectionFactory;

    public HealthController(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        
        using var connection = _connectionFactory.CreateConnection();

        var result = await connection.QuerySingleAsync<int>("SELECT 1;");

        return Ok(new
        {
            status = "Healthy",
            database = result == 1 ? "Connected" : "Unavailable"
        });
    }
}