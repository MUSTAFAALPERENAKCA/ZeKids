-- Admin kullanıcısı için gerçek hash oluşturulacak
-- Önce frontend'den kayıt yapıp hash'i alacağız

-- Geçici: Admin kullanıcısını şimdilik sil ve yeniden oluştur
DELETE FROM "Users" WHERE "Email" = 'admin@zekids.com';

-- Şimdi backend API ile kayıt yapılacak
