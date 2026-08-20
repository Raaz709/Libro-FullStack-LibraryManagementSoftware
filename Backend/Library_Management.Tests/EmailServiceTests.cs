using Library_Management.Models;
using Library_Management.Repositories;
using Library_Management.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Library_Management.Tests;

public class EmailServiceTests
{
    private readonly Mock<IEmailTemplateRepository> _templateRepo = new();
    private readonly Mock<IEmailSender> _emailSender = new();
    private readonly Mock<ILogger<EmailService>> _logger = new();

    private EmailService CreateService() =>
        new(_templateRepo.Object, _emailSender.Object, _logger.Object);

    private static User NewUser() => new()
    {
        Id = 12,
        FirstName = "Jane",
        LastName = "Doe",
        Email = "jane@test.com",
        MembershipNumber = "LBM-123456"
    };

    private static EmailTemplate WelcomeTemplate() => new()
    {
        Code = "Welcome",
        Subject = "Welcome to the Library, {{FirstName}}!",
        BodyHtml = "<p>Hello {{FirstName}}, your number is {{MembershipNumber}}.</p>"
    };

    [Fact]
    public async Task SendWelcomeAsync_TemplateFound_RendersPlaceholders()
    {
        _templateRepo.Setup(r => r.GetByCodeAsync("Welcome"))
            .ReturnsAsync(WelcomeTemplate());

        var result = await CreateService().SendWelcomeAsync(NewUser());

        Assert.True(result);
        _emailSender.Verify(s => s.SendAsync(
            "jane@test.com",
            "Welcome to the Library, Jane!",
            It.Is<string>(b => b.Contains("your number is LBM-123456"))),
            Times.Once);
    }

    [Fact]
    public async Task SendWelcomeAsync_TemplateMissing_StillSendsDefault()
    {
        _templateRepo.Setup(r => r.GetByCodeAsync("Welcome"))
            .ReturnsAsync((EmailTemplate?)null);

        var result = await CreateService().SendWelcomeAsync(NewUser());

        Assert.True(result);
        _emailSender.Verify(s => s.SendAsync(
            "jane@test.com",
            "Welcome to the Library",
            It.Is<string>(b =>
                b.Contains("LBM-123456") && b.Contains("Jane"))),
            Times.Once);
    }

    [Fact]
    public async Task SendWelcomeAsync_SmtpFailure_ReturnsFalse()
    {
        _templateRepo.Setup(r => r.GetByCodeAsync("Welcome"))
            .ReturnsAsync(WelcomeTemplate());
        _emailSender.Setup(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .ThrowsAsync(new IOException("SMTP down"));

        var result = await CreateService().SendWelcomeAsync(NewUser());

        Assert.False(result);
    }

    [Fact]
    public async Task SendTemplateAsync_MissingTemplate_ReturnsFalse()
    {
        _templateRepo.Setup(r => r.GetByCodeAsync("Nope"))
            .ReturnsAsync((EmailTemplate?)null);

        var result = await CreateService().SendTemplateAsync("Nope", "a@b.com");

        Assert.False(result);
        _emailSender.Verify(s => s.SendAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }
}