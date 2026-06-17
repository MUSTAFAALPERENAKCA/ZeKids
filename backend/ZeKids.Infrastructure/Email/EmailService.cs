using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace ZeKids.Infrastructure.Email;

public class EmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _username;
    private readonly string _password;

    public EmailService(string smtpHost, int smtpPort, string username, string password)
    {
        _smtpHost = smtpHost;
        _smtpPort = smtpPort;
        _username = username;
        _password = password;
    }

    public async Task SendVerificationEmailAsync(string toEmail, string token)
    {
        var verificationLink = $"http://localhost:4200/verify-email?token={token}";
        
        // Development mode: Console'a yazdır
        Console.WriteLine("==============================================");
        Console.WriteLine("📧 EMAIL VERIFICATION");
        Console.WriteLine($"To: {toEmail}");
        Console.WriteLine($"Token: {token}");
        Console.WriteLine($"Link: {verificationLink}");
        Console.WriteLine("==============================================");
        
        // Production'da gerçek email gönder
        // Şimdilik return et
        return;
        
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .logo {{ font-size: 32px; font-weight: bold; color: #0ea5e9; }}
        .content {{ margin: 30px 0; line-height: 1.6; color: #334155; }}
        .button {{ display: inline-block; background-color: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>ZeKids</div>
            <p style='color: #64748b;'>Dijital Terapötik Platform</p>
        </div>
        <div class='content'>
            <h2 style='color: #1e293b;'>E-posta Adresinizi Doğrulayın</h2>
            <p>Merhaba,</p>
            <p>ZeKids platformuna hoş geldiniz! Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayın:</p>
            <div style='text-align: center;'>
                <a href='{verificationLink}' class='button'>E-postamı Doğrula</a>
            </div>
            <p>Eğer bu kaydı siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            <p style='margin-top: 30px; font-size: 12px; color: #94a3b8;'>
                Butona tıklayamıyorsanız, aşağıdaki linki tarayıcınıza kopyalayın:<br>
                <span style='color: #0ea5e9;'>{verificationLink}</span>
            </p>
        </div>
        <div class='footer'>
            <p>&copy; 2026 ZeKids. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(toEmail, "ZeKids - E-posta Doğrulama", htmlBody);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("ZeKids", _username));
        message.To.Add(new MailboxAddress("", toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_username, _password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
