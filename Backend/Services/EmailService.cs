using Library_Management.Models;
using Library_Management.Repositories;

namespace Library_Management.Services;

public interface IEmailService
{
    Task<bool> SendWelcomeAsync(User user);
    Task<bool> SendTemplateAsync(
        string code,
        string to,
        IReadOnlyDictionary<string, string>? placeholders = null);
}

public class EmailService : IEmailService
{
    private readonly IEmailTemplateRepository _templateRepository;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IEmailTemplateRepository templateRepository,
        IEmailSender emailSender,
        ILogger<EmailService> logger)
    {
        _templateRepository = templateRepository;
        _emailSender = emailSender;
        _logger = logger;
    }

    public async Task<bool> SendWelcomeAsync(User user)
    {
        var template = await _templateRepository.GetByCodeAsync("Welcome");

        var placeholders = new Dictionary<string, string>
        {
            ["FirstName"] = user.FirstName,
            ["LastName"] = user.LastName,
            ["Email"] = user.Email,
            ["MembershipNumber"] = user.MembershipNumber
        };

        if (template is null)
        {
            return await SendAsync(
                user.Email,
                "Welcome to the Library",
                BuildDefaultWelcomeBody(user),
                placeholders);
        }

        return await SendAsync(
            user.Email,
            template.Subject,
            template.BodyHtml,
            placeholders);
    }

    public async Task<bool> SendTemplateAsync(
        string code,
        string to,
        IReadOnlyDictionary<string, string>? placeholders = null)
    {
        var template = await _templateRepository.GetByCodeAsync(code);
        if (template is null)
        {
            _logger.LogWarning(
                "Email template '{Code}' was not found; no email sent to {To}.",
                code,
                to);
            return false;
        }

        return await SendAsync(to, template.Subject, template.BodyHtml, placeholders);
    }

    private async Task<bool> SendAsync(
        string to,
        string subject,
        string bodyHtml,
        IReadOnlyDictionary<string, string>? placeholders)
    {
        try
        {
            await _emailSender.SendAsync(
                to,
                Render(subject, placeholders),
                Render(bodyHtml, placeholders));
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}.", to);
            return false;
        }
    }

    private static string Render(
        string input,
        IReadOnlyDictionary<string, string>? placeholders)
    {
        if (placeholders is null)
        {
            return input;
        }

        var result = input;
        foreach (var (key, value) in placeholders)
        {
            result = result.Replace(
                "{{" + key + "}}",
                value,
                StringComparison.Ordinal);
        }

        return result;
    }

    private static string BuildDefaultWelcomeBody(User user)
    {
        return $"""
            <p>Hello {user.FirstName} {user.LastName},</p>
            <p>Welcome to the Library! Your membership has been activated.</p>
            <p>Your membership number is <strong>{user.MembershipNumber}</strong>.</p>
            <p>You can now borrow books, track your loans, and manage your account.</p>
            <p>Regards,<br/>Library Team</p>
            """;
    }
}