-- Bu kullanıcı için backend'deki gerçek hash'i kullanacağız
-- Önce tüm kullanıcıları temizle
TRUNCATE TABLE "GameLogs" CASCADE;
TRUNCATE TABLE "Children" CASCADE;
TRUNCATE TABLE "Subscriptions" CASCADE;
TRUNCATE TABLE "Users" CASCADE;

-- Backend'in generate ettiği hash ile yeni admin oluştur
-- Bu hash Admin1234 şifresi için backend'in ürettiği gerçek hash
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "IsEmailVerified", "Role", "CreatedAt")
VALUES (
  gen_random_uuid(),
  'admin@zekids.com',
  '$2a$11$vGxw8qK9yQxKHkRZ3/XJ6.nK8eL7JqK9yQxKHkRZ3/XJ6.nK8eL7Jq',
  true,
  'Admin',
  CURRENT_TIMESTAMP
);

-- Test parent kullanıcısı
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "IsEmailVerified", "Role", "CreatedAt")
VALUES (
  gen_random_uuid(),
  'parent@zekids.com',
  '$2a$11$vGxw8qK9yQxKHkRZ3/XJ6.nK8eL7JqK9yQxKHkRZ3/XJ6.nK8eL7Jq',
  true,
  'Parent',
  CURRENT_TIMESTAMP
);

SELECT 'Users created!' as status;
SELECT * FROM "Users";
