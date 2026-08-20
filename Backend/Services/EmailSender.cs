using MailKit.Net.Smtp;
using MailKit.Security;
using Library_Management.Models;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Library_Management.Services;

public interface IEmailSender
{
    bool IsEnabled { get; }
    Task SendAsync(string to, string subject, string htmlBody);
}

public class EmailSender : IEmailSender
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailSender> _logger;

    public EmailSender(IOptions<EmailSettings> settings, ILogger<EmailSender> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public bool IsEnabled => _settings.Enable;

    public async Task SendAsync(string to, string subject, string htmlBody)
    {
        if (!_settings.Enable)
        {
            _logger.LogInformation(
                "SMTP is disabled; email to {To} was skipped.",
                to);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.From));
        message.To.Add(new MailboxAddress(string.Empty, to));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(
            _settings.Host,
            _settings.Port,
            _settings.UseSsl
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTlsWhenAvailable);

        if (!string.IsNullOrEmpty(_settings.Username))
        {
            await client.AuthenticateAsync(_settings.Username, _settings.Password);
        }

        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("Email sent to {To}.", to);
    }
}