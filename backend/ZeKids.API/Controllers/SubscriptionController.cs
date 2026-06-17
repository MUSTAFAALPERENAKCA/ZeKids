using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using ZeKids.Core.Entities;
using ZeKids.Infrastructure.Data;

namespace ZeKids.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public SubscriptionController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
        StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentSubscription()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var subscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (subscription == null)
        {
            return Ok(new { hasSubscription = false });
        }

        return Ok(new
        {
            hasSubscription = true,
            subscription = new
            {
                subscription.Id,
                subscription.PlanName,
                subscription.Price,
                subscription.Status,
                subscription.ExpiresAt,
                subscription.CreatedAt
            }
        });
    }

    [HttpPost("create-checkout-session")]
    public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return BadRequest(new { message = "Kullanıcı bulunamadı" });
        }

        // Get price from system settings
        var priceSetting = await _context.SystemSettings
            .FirstOrDefaultAsync(s => s.Key == "PremiumMonthlyPrice");

        var priceAmount = priceSetting != null 
            ? decimal.Parse(priceSetting.Value) 
            : 299.00m;

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "try",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = "ZeKids Premium Üyelik",
                            Description = "Aylık premium üyelik - Sınırsız oyun ve detaylı raporlar"
                        },
                        UnitAmount = (long)(priceAmount * 100), // Stripe uses cents
                        Recurring = new SessionLineItemPriceDataRecurringOptions
                        {
                            Interval = "month"
                        }
                    },
                    Quantity = 1
                }
            },
            Mode = "subscription",
            SuccessUrl = $"{dto.SuccessUrl}?session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = dto.CancelUrl,
            ClientReferenceId = userId.ToString(),
            CustomerEmail = user.Email
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return Ok(new { sessionId = session.Id, url = session.Url });
    }

    [HttpPost("cancel")]
    public async Task<IActionResult> CancelSubscription()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var subscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == "Active");

        if (subscription == null)
        {
            return BadRequest(new { message = "Aktif abonelik bulunamadı" });
        }

        if (!string.IsNullOrEmpty(subscription.StripeSubscriptionId))
        {
            var service = new Stripe.SubscriptionService();
            await service.CancelAsync(subscription.StripeSubscriptionId);
        }

        subscription.Status = "Cancelled";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Abonelik iptal edildi" });
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var stripeSignature = Request.Headers["Stripe-Signature"];

        try
        {
            var webhookSecret = _configuration["Stripe:WebhookSecret"];
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                stripeSignature,
                webhookSecret
            );

            switch (stripeEvent.Type)
            {
                case Events.CheckoutSessionCompleted:
                    var session = stripeEvent.Data.Object as Session;
                    await HandleCheckoutSessionCompleted(session!);
                    break;

                case Events.CustomerSubscriptionUpdated:
                    var subscription = stripeEvent.Data.Object as Stripe.Subscription;
                    await HandleSubscriptionUpdated(subscription!);
                    break;

                case Events.CustomerSubscriptionDeleted:
                    var deletedSubscription = stripeEvent.Data.Object as Stripe.Subscription;
                    await HandleSubscriptionDeleted(deletedSubscription!);
                    break;

                case Events.InvoicePaymentSucceeded:
                    var invoice = stripeEvent.Data.Object as Invoice;
                    await HandleInvoicePaymentSucceeded(invoice!);
                    break;

                case Events.InvoicePaymentFailed:
                    var failedInvoice = stripeEvent.Data.Object as Invoice;
                    await HandleInvoicePaymentFailed(failedInvoice!);
                    break;
            }

            return Ok();
        }
        catch (StripeException)
        {
            return BadRequest();
        }
    }

    private async Task HandleCheckoutSessionCompleted(Session session)
    {
        var userId = Guid.Parse(session.ClientReferenceId);
        var stripeSubscriptionId = session.SubscriptionId;

        var existingSubscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (existingSubscription != null)
        {
            existingSubscription.Status = "Active";
            existingSubscription.StripeSubscriptionId = stripeSubscriptionId;
            existingSubscription.ExpiresAt = DateTime.UtcNow.AddMonths(1);
        }
        else
        {
            var subscription = new Core.Entities.Subscription
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PlanName = "Premium Monthly",
                Price = session.AmountTotal!.Value / 100m,
                Status = "Active",
                StripeSubscriptionId = stripeSubscriptionId,
                ExpiresAt = DateTime.UtcNow.AddMonths(1),
                CreatedAt = DateTime.UtcNow
            };

            _context.Subscriptions.Add(subscription);
        }

        await _context.SaveChangesAsync();
    }

    private async Task HandleSubscriptionUpdated(Stripe.Subscription subscription)
    {
        var dbSubscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == subscription.Id);

        if (dbSubscription != null)
        {
            dbSubscription.Status = subscription.Status == "active" ? "Active" : "Passive";
            await _context.SaveChangesAsync();
        }
    }

    private async Task HandleSubscriptionDeleted(Stripe.Subscription subscription)
    {
        var dbSubscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == subscription.Id);

        if (dbSubscription != null)
        {
            dbSubscription.Status = "Cancelled";
            await _context.SaveChangesAsync();
        }
    }

    private async Task HandleInvoicePaymentSucceeded(Invoice invoice)
    {
        var dbSubscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == invoice.SubscriptionId);

        if (dbSubscription != null)
        {
            dbSubscription.ExpiresAt = DateTime.UtcNow.AddMonths(1);
            await _context.SaveChangesAsync();
        }
    }

    private async Task HandleInvoicePaymentFailed(Invoice invoice)
    {
        var dbSubscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == invoice.SubscriptionId);

        if (dbSubscription != null)
        {
            dbSubscription.Status = "Passive";
            await _context.SaveChangesAsync();
        }
    }
}

public class CreateCheckoutDto
{
    public string SuccessUrl { get; set; } = string.Empty;
    public string CancelUrl { get; set; } = string.Empty;
}
