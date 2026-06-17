-- Seed data for testing

-- Test user (password: Test1234)
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "IsEmailVerified", "Role", "CreatedAt", "VerificationToken")
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'test@zekids.com',
  '$2a$11$rQZ3vF7mXq5Y8n.LZxqxZeH8J9kF7qVxH8J9kF7qVxH8J9kF7qVx',
  true,
  'Parent',
  CURRENT_TIMESTAMP,
  NULL
);

-- Test child
INSERT INTO "Children" ("Id", "ParentId", "NicknameEncrypted", "Age", "Gender", "CreatedAt")
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'TestEncryptedNickname',
  8,
  'Erkek',
  CURRENT_TIMESTAMP
);

-- Sample game logs with MRT/RTV
INSERT INTO "GameLogs" ("Id", "ChildId", "GameId", "Score", "Duration", "MRT", "RTV", "CreatedAt")
VALUES
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 'ant-test', 9, 45000, 450.0, 85.5, CURRENT_TIMESTAMP - INTERVAL '7 days'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 'ant-test', 10, 42000, 420.0, 65.2, CURRENT_TIMESTAMP - INTERVAL '5 days'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 'coin-marksman', 85, 30000, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '3 days'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 'ant-test', 10, 40000, 395.0, 48.3, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 'harvest-moon', 70, 180000, NULL, NULL, CURRENT_TIMESTAMP);

-- Admin user (password: Admin1234)
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "IsEmailVerified", "Role", "CreatedAt")
VALUES (
  '99999999-9999-9999-9999-999999999999'::uuid,
  'admin@zekids.com',
  '$2a$11$rQZ3vF7mXq5Y8n.LZxqxZeH8J9kF7qVxH8J9kF7qVxH8J9kF7qVx',
  true,
  'Admin',
  CURRENT_TIMESTAMP
);

-- Verify
SELECT 'Seed data inserted successfully!' as status;
SELECT COUNT(*) as users FROM "Users";
SELECT COUNT(*) as children FROM "Children";
SELECT COUNT(*) as gamelogs FROM "GameLogs";
