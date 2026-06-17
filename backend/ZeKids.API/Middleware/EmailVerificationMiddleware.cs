using System.Security.Claims;

namespace ZeKids.API.Middleware;

public class EmailVerificationMiddleware
{
    private readonly RequestDelegate _next;

    public EmailVerificationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip verification for auth endpoints
        if (context.Request.Path.StartsWithSegments("/api/auth"))
        {
            await _next(context);
            return;
        }

        // Check if user is authenticated
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var isEmailVerifiedClaim = context.User.FindFirst("IsEmailVerified")?.Value;
            
            if (isEmailVerifiedClaim == "False")
            {
                context.Response.StatusCode = 403;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new 
                { 
                    message = "E-posta doğrulaması gerekli",
                    code = "EmailNotVerified" 
                });
                return;
            }
        }

        await _next(context);
    }
}
