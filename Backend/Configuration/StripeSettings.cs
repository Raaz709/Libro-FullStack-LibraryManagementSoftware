using Microsoft.Extensions.Configuration;

namespace Library_Management.Configuration;

public class StripeSettings
{
    // Test mode Stripe keys
    public string SecretKey { get; set; } = "sk_test_";
    public string PublishableKey { get; set; } = "pk_test_";
    
    public StripeSettings(IConfiguration configuration)
    {
        // Override with actual keys from configuration if available
        SecretKey = configuration["Stripe:SecretKey"] ?? "sk_test_";
        PublishableKey = configuration["Stripe:PublishableKey"] ?? "pk_test_";
    }
}