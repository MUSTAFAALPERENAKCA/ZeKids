# ZeKids Platform - Hızlı Başlangıç Kılavuzu

## 🎯 Önkoşullar Kurulumu

Projeyi çalıştırmak için aşağıdaki araçların yüklenmesi gerekiyor:

### 1. .NET 8 SDK Kurulumu

**.NET SDK henüz kurulu değil.** Aşağıdaki adımları izleyin:

#### Homebrew ile (Önerilen):
```bash
brew install --cask dotnet-sdk
```

**Not:** Bu komut sudo şifresi isteyecektir. Terminal size soracaktır, şifrenizi girin.

Alternatif olarak manuel yükleme:
1. [.NET 8 SDK sayfasını](https://dotnet.microsoft.com/download/dotnet/8.0) açın
2. macOS ARM64 (Apple Silicon) installer'ı indirin
3. .pkg dosyasını çalıştırın ve talimatları takip edin

Kurulum sonrası doğrulama:
```bash
dotnet --version
# Beklenen çıktı: 8.0.x
```

### 2. Docker Kurulumu (PostgreSQL için)

**Docker henüz kurulu değil.** Aşağıdaki adımlardan birini izleyin:

#### Seçenek A: Docker Desktop (Önerilen):
1. [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) sayfasını açın
2. Apple Silicon (M1/M2) veya Intel versiyonunu indirin
3. DMG dosyasını açıp Docker.app'i Applications'a sürükleyin
4. Docker Desktop'ı başlatın

Doğrulama:
```bash
docker --version
docker-compose --version
```

#### Seçenek B: Homebrew ile:
```bash
brew install --cask docker
```

Sonra Docker Desktop uygulamasını açın (Applications'da).

#### Seçenek C: Manuel PostgreSQL Kurulumu (Docker olmadan):

Eğer Docker kurmak istemiyorsanız:

```bash
# Homebrew ile PostgreSQL
brew install postgresql@16

# PostgreSQL'i başlat
brew services start postgresql@16

# Database oluştur
createdb zekids_dev
```

Connection string'i güncelle (`backend/ZeKids.API/appsettings.Development.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=zekids_dev;Username=YOUR_USERNAME;Password="
  }
}
```

---

## ⚡ Hızlı Başlatma

### Adım 1: PostgreSQL'i Başlatma

#### Docker kullanıyorsanız:
```bash
cd /Users/alperen/ZeKids
docker-compose up -d
```

Kontrol:
```bash
docker ps
# zekids-postgres container'ın çalıştığını görmelisiniz
```

#### Manuel PostgreSQL kullanıyorsanız:
```bash
brew services start postgresql@16
```

### Adım 2: Backend Çalıştırma

```bash
cd /Users/alperen/ZeKids/backend

# Paketleri yükle
dotnet restore

# Migration oluştur ve uygula
cd ZeKids.API
dotnet ef migrations add InitialCreate --project ../ZeKids.Infrastructure --startup-project .
dotnet ef database update

# Backend'i başlat
dotnet run
```

Backend `http://localhost:5000` adresinde çalışacak.  
Swagger UI: `http://localhost:5000/swagger`

### Adım 3: Frontend Çalıştırma

Yeni bir terminal açın:

```bash
cd /Users/alperen/ZeKids/frontend/zekids-frontend

# Paketler zaten yüklü ama emin olmak için:
npm install

# Frontend'i başlat
ng serve
```

Frontend `http://localhost:4200` adresinde çalışacak.

---

## 🧪 İlk Test

### 1. Kayıt Ol
1. Tarayıcıda `http://localhost:4200` aç
2. "Kayıt Ol" butonuna tıkla
3. E-posta: `test@example.com`, Şifre: `Test1234`
4. Kayıt ol

### 2. E-posta Doğrulama

**Development modunda email konsola yazdırılır.** Backend terminal'inde şuna benzer bir log göreceksiniz:

```
[INFO] Email sent to test@example.com
[INFO] Verification link: http://localhost:4200/verify-email?token=xxxxx
```

Bu linke tıklayın veya tarayıcıda manuel olarak açın.

### 3. Giriş Yap

E-posta doğrulandıktan sonra giriş yapın.

### 4. Çocuk Profili Oluştur

1. Dashboard'da "Çocuk Ekle" butonuna tıkla
2. İsim: "Test Çocuk", Yaş: 8, Cinsiyet: Erkek
3. Kaydet

### 5. Oyun Oyna

1. Sol menüden "Oyunlar"a git
2. "ANT Test Demo"yu seç
3. Oyunu tamamla (ok tuşları ile)
4. Otomatik olarak skor kaydedilecek

### 6. Veri Kontrolü

Backend terminalinde:
```
[INFO] POST /api/gamelogs - 200 OK
[INFO] MRT: 435.0ms, RTV: 51.23ms
```

---

## ⚙️ Konfigürasyon

### Email Ayarları

Gmail SMTP için:

1. Gmail hesabınızda [2FA'yı aktifleştirin](https://myaccount.google.com/security)
2. [App Password oluşturun](https://myaccount.google.com/apppasswords)
3. `backend/ZeKids.API/appsettings.Development.json` düzenle:

```json
{
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "Username": "your-email@gmail.com",
    "AppPassword": "abcd efgh ijkl mnop"
  }
}
```

4. Backend'i yeniden başlat

---

## 🐛 Sorun Giderme

### Sorun: "dotnet: command not found"

**Çözüm:** .NET SDK kurulu değil. Yukarıdaki adım 1'i takip edin.

### Sorun: "docker: command not found"

**Çözüm:** Docker kurulu değil veya çalışmıyor.
- Docker Desktop yüklü mü kontrol edin
- Docker Desktop uygulaması açık mı kontrol edin
- Alternatif: Manuel PostgreSQL kurulumu yapın

### Sorun: "Connection refused (PostgreSQL)"

**Çözüm:**
```bash
# Docker container çalışıyor mu?
docker ps

# Çalışmıyorsa başlat
docker-compose up -d

# Manuel PostgreSQL kullanıyorsanız
brew services start postgresql@16
```

### Sorun: "Port 5000 already in use"

**Çözüm:**
```bash
# Port'u kullanan process'i bul
lsof -i :5000

# Process'i kapat
kill -9 <PID>
```

### Sorun: "Migration already exists"

**Çözüm:**
```bash
cd backend/ZeKids.API
dotnet ef database drop --force
dotnet ef database update
```

### Sorun: "Email gönderilmiyor"

**Kontrol listesi:**
- [ ] Gmail App Password kullanıldı mı?
- [ ] 2FA aktif mi?
- [ ] Username tam email adresi mi?
- [ ] Port 587 mi?

**Geçici çözüm:** Development'ta email console'a yazdırılır, bu yeterli test için.

---

## 📊 Veritabanı Erişimi

### psql ile bağlanma (Docker):
```bash
docker exec -it zekids-postgres psql -U postgres -d zekids_dev
```

### Örnek sorgular:
```sql
-- Tüm kullanıcıları listele
SELECT * FROM "Users";

-- Çocukları listele
SELECT * FROM "Children";

-- Game logları
SELECT * FROM "GameLogs";

-- MRT ortalamaları
SELECT AVG("MRT") FROM "GameLogs" WHERE "MRT" IS NOT NULL;
```

### pgAdmin kullanımı:

1. [pgAdmin indir](https://www.pgadmin.org/download/)
2. Yeni server ekle:
   - Host: localhost
   - Port: 5432
   - Database: zekids_dev
   - Username: postgres
   - Password: postgres

---

## 🔄 Temizlik ve Sıfırlama

### Database'i sıfırla:
```bash
cd backend/ZeKids.API
dotnet ef database drop --force
dotnet ef database update
```

### Docker container'ları temizle:
```bash
docker-compose down -v
docker-compose up -d
```

### Frontend cache'i temizle:
```bash
cd frontend/zekids-frontend
rm -rf node_modules
rm -rf dist
npm install
```

---

## 🚀 Production Deployment (Gelecek)

Production deployment için şu adımlar gerekli:

### 1. Environment Variables

```bash
# Backend
export ConnectionStrings__DefaultConnection="production-db-string"
export Jwt__SecretKey="strong-secret-key-min-32-chars"
export Email__Username="production-email@zekids.com.tr"
export Email__AppPassword="production-password"

# Frontend
# environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.zekids.com.tr/api'
};
```

### 2. SSL Sertifikası

```bash
# Let's Encrypt ile
sudo certbot --nginx -d zekids.com.tr -d www.zekids.com.tr
```

### 3. Deployment

- **Backend:** Azure App Service, AWS EC2, veya DigitalOcean Droplet
- **Frontend:** Vercel, Netlify, veya Azure Static Web Apps
- **Database:** Managed PostgreSQL (Azure, AWS RDS, DigitalOcean)

---

## 📚 Ek Kaynaklar

- [README.md](./README.md) - Genel proje bilgisi
- [API_ENDPOINTS.md](./docs/API_ENDPOINTS.md) - API dökümantasyonu
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - Database şeması
- [GAME_INTEGRATION_GUIDE.md](./docs/GAME_INTEGRATION_GUIDE.md) - Oyun ekleme kılavuzu

---

## ✅ Başarı Kriterleri

Proje başarılı şekilde çalışıyorsa:

- [ ] Frontend `http://localhost:4200` açılıyor
- [ ] Backend `http://localhost:5000/swagger` açılıyor
- [ ] Kayıt/giriş çalışıyor
- [ ] E-posta doğrulama (console'da) görünüyor
- [ ] Çocuk profili oluşturuluyor
- [ ] ANT Test Demo oynanabiliyor
- [ ] Oyun sonu verisi kaydediliyor
- [ ] Backend'de MRT/RTV hesaplanıyor

---

**İyi çalışmalar! 🎉**

Herhangi bir sorunla karşılaşırsanız, yukarıdaki sorun giderme bölümünü kontrol edin veya GitHub issues açın.
