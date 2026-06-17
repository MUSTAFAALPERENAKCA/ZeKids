using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ZeKids.API.Middleware;
using ZeKids.API.Services;
using ZeKids.Infrastructure.Data;
using ZeKids.Infrastructure.Email;
using ZeKids.Infrastructure.Security;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ZeKids API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("JWT Secret not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "zekids.com.tr";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "zekids-frontend";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Services
builder.Services.AddScoped<AuthService>(sp =>
{
    var context = sp.GetRequiredService<ApplicationDbContext>();
    var emailService = sp.GetRequiredService<EmailService>();
    return new AuthService(context, emailService, jwtSecret, jwtIssuer, jwtAudience);
});

builder.Services.AddScoped<ReportingService>();

builder.Services.AddSingleton<EncryptionService>(sp =>
{
    var key = builder.Configuration["Encryption:Key"] ?? throw new InvalidOperationException("Encryption Key not configured");
    var iv = builder.Configuration["Encryption:IV"] ?? throw new InvalidOperationException("Encryption IV not configured");
    return new EncryptionService(key, iv);
});

builder.Services.AddSingleton<EmailService>(sp =>
{
    var smtpHost = builder.Configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
    var smtpPort = int.Parse(builder.Configuration["Email:SmtpPort"] ?? "587");
    var username = builder.Configuration["Email:Username"] ?? throw new InvalidOperationException("Email Username not configured");
    var password = builder.Configuration["Email:AppPassword"] ?? throw new InvalidOperationException("Email Password not configured");
    return new EmailService(smtpHost, smtpPort, username, password);
});

var app = builder.Build();

// Auto-migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        dbContext.Database.Migrate();
        Console.WriteLine("✅ Database migration completed successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database migration failed: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("AllowFrontend");

app.UseAuthentication();

// GEÇİCİ: Email verification middleware'i devre dışı
// app.UseMiddleware<EmailVerificationMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();
