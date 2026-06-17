# ZeKids - Dijital Terapötik (DTx) SaaS Platformu

DEHB (Dikkat Eksikliği ve Hiperaktivite Bozukluğu) yönetimi için geliştirilmiş kurumsal DTx platformu.

## 🏗️ Teknoloji Stack

### Backend
- .NET 8 Web API
- PostgreSQL (Entity Framework Core)
- JWT Authentication
- MailKit (Email)
- BCrypt (Password Hashing)
- AES-256 (Data Encryption)

### Frontend
- Angular 18
- TailwindCSS
- Chart.js (Raporlar)
- Angular Material

## 📋 Gereksinimler

Projeyi çalıştırmak için aşağıdaki araçların yüklü olması gerekir:

### Zorunlu
- **Node.js** (v18+) ve npm
- **Docker** (PostgreSQL için)

### Opsiyonel (Backend çalıştırmak için)
- **.NET 8 SDK** - [İndir](https://dotnet.microsoft.com/download/dotnet/8.0)

## 🚀 Kurulum ve Çalıştırma

### 1. Proje Dizini
```bash
cd /Users/alperen/ZeKids
```

### 2. PostgreSQL Başlatma (Docker)
```bash
docker-compose up -d
```

PostgreSQL hazır olduğunu kontrol edin:
```bash
docker ps
```

### 3. .NET SDK Yükleme

**.NET SDK henüz yüklenmemiştir.** Aşağıdaki yöntemlerden birini kullanarak yükleyin:

#### Homebrew ile (önerilen):
```bash
brew install --cask dotnet-sdk
```

**Not:** Sudo şifresi gerektirecektir.

#### Manuel indirme:
[.NET 8 SDK'yı buradan indirin](https://dotnet.microsoft.com/download/dotnet/8.0)

### 4. Backend Kurulumu

.NET SDK yüklendikten sonra:

```bash
cd backend
dotnet restore
```

#### Database Migration Oluşturma ve Uygulama:
```bash
cd ZeKids.API
dotnet ef migrations add InitialCreate --project ../ZeKids.Infrastructure --startup-project .
dotnet ef database update
```

#### Backend Çalıştırma:
```bash
dotnet run --project ZeKids.API
```

Backend: `http://localhost:5000` adresinde çalışacak
Swagger UI: `http://localhost:5000/swagger`

### 5. Frontend Çalıştırma

Yeni bir terminal açın:

```bash
cd frontend/zekids-frontend
npm install
ng serve
```

Frontend: `http://localhost:4200` adresinde çalışacak

## ⚙️ Yapılandırma

### Email Ayarları (Gmail SMTP)

Backend'de email gönderimi için Gmail App Password gereklidir:

1. Gmail hesabınızda 2FA'yı aktifleştirin
2. [App Password oluşturun](https://myaccount.google.com/apppasswords)
3. `backend/ZeKids.API/appsettings.Development.json` dosyasını düzenleyin:

```json
{
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "Username": "your-email@gmail.com",
    "AppPassword": "your-16-char-app-password"
  }
}
```

### Stripe Test Keys (Opsiyonel)

Stripe entegrasyonu için [test keys](https://dashboard.stripe.com/test/apikeys) alın:

```json
{
  "Stripe": {
    "SecretKey": "sk_test_YOUR_SECRET_KEY",
    "PublishableKey": "pk_test_YOUR_PUBLISHABLE_KEY"
  }
}
```

## 🎮 Kullanım Akışı

### 1. Kayıt ve Giriş
1. `http://localhost:4200` adresine gidin
2. "Kayıt Ol" butonuna tıklayın
3. E-posta ve şifre ile kayıt olun
4. **E-posta doğrulama:** Terminal'de email service loglarını kontrol edin (geliştirme modunda console'a yazdırılır)
5. Doğrulama linkine tıklayın veya token'ı manuel olarak kullanın
6. Giriş yapın

### 2. Çocuk Profili Oluşturma
1. Dashboard'da "Çocuk Ekle" butonuna tıklayın
2. İsim, yaş ve cinsiyet bilgilerini girin
3. Kaydedin

### 3. Oyun Oynama ve Veri Toplama
1. "Oyunlar" menüsüne gidin
2. Bir oyun seçin (ANT Test Demo)
3. Oyunu tamamlayın
4. Otomatik olarak sonuçlar kaydedilir
5. MRT (Mean Reaction Time) ve RTV (Reaction Time Variability) hesaplanır

### 4. Gelişim Raporu
1. Dashboard'da "Gelişim Raporu" bölümüne gidin
2. MRT ve RTV trendlerini görüntüleyin
3. Klinik yorumları okuyun

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/login` - Giriş
- `POST /api/auth/verify-email` - E-posta doğrulama

### Children
- `GET /api/children` - Çocukları listele
- `POST /api/children` - Çocuk ekle
- `DELETE /api/children/{id}` - Çocuk sil

### Game Logs
- `POST /api/gamelogs` - Oyun kaydı oluştur
- `GET /api/gamelogs/child/{childId}` - Çocuğun oyun logları
- `GET /api/gamelogs/child/{childId}/reports` - Gelişim raporu

Swagger UI: `http://localhost:5000/swagger`

## 🗄️ Database Schema

### Tables
- **Users:** Ebeveyn ve admin kullanıcıları
- **Children:** Çocuk profilleri (şifreli nickname)
- **GameLogs:** Oyun kayıtları (MRT, RTV, raw data)
- **Subscriptions:** Abonelik bilgileri
- **SystemSettings:** Sistem ayarları

## 🧪 Test Senaryoları

### Senaryo 1: Ziyaretçi Akışı
1. Landing page'i ziyaret et
2. "Kayıt Ol" ile kayıt ol
3. E-posta doğrula
4. Dashboard'a gir

### Senaryo 2: Oyun Veri Akışı
1. Dashboard'da çocuk profili oluştur
2. "Oyunlar" menüsüne git
3. ANT Test Demo'yu oyna
4. Oyun tamamlandıktan sonra:
   - Network tab'da `POST /api/gamelogs` isteğini gör
   - Response'da MRT ve RTV değerlerini kontrol et
5. Dashboard'da gelişim raporunu kontrol et

## 🔒 Güvenlik

- **JWT Authentication:** Token-based auth
- **Email Verification:** Zorunlu e-posta doğrulama
- **AES-256 Encryption:** Çocuk isimleri şifrelenmiş
- **BCrypt:** Şifre hashleme
- **CORS:** Frontend origin kontrolü

## 🐛 Troubleshooting

### Backend başlamıyor
- PostgreSQL container'ının çalıştığını kontrol edin: `docker ps`
- Connection string'i kontrol edin: `appsettings.Development.json`
- Migration'ların uygulandığını kontrol edin: `dotnet ef database update`

### Frontend compile hatası
- Node modules'i yeniden yükleyin: `rm -rf node_modules && npm install`
- Angular CLI versiyonunu kontrol edin: `ng version`

### Email gönderilmiyor
- Gmail App Password kullandığınızdan emin olun
- SMTP ayarlarını kontrol edin
- Development modunda console loglarını kontrol edin

### Database connection error
- Docker container'ın çalıştığından emin olun
- Port 5432'nin açık olduğunu kontrol edin: `lsof -i :5432`

## 📝 Önemli Notlar

1. **.NET SDK Gerekli:** Backend'i çalıştırmak için .NET 8 SDK yüklü olmalıdır
2. **Gmail App Password:** Email doğrulama için Gmail App Password gereklidir
3. **Docker:** PostgreSQL için Docker kullanılmaktadır
4. **Development Mode:** Proje şu an development modunda yapılandırılmıştır

## 🔮 Gelecek Özellikler

- [ ] Stripe abonelik entegrasyonu
- [ ] Admin paneli
- [ ] 4 ek oyun entegrasyonu (Harvest Moon, Coin Marksman, Hoppa, FlagMatch)
- [ ] Parental Gate komponenti
- [ ] Badge ve streak sistemi
- [ ] Detaylı gelişim grafikleri (Chart.js)

## 📞 Destek

Herhangi bir sorun için lütfen GitHub issues kullanın veya dokümantasyonu kontrol edin.

---

**© 2026 ZeKids - Tüm hakları saklıdır**
