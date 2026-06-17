-- ZeKids Database Schema
-- PostgreSQL 16

-- Drop existing tables if any
DROP TABLE IF EXISTS "GameLogs" CASCADE;
DROP TABLE IF EXISTS "Children" CASCADE;
DROP TABLE IF EXISTS "Subscriptions" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;
DROP TABLE IF EXISTS "SystemSettings" CASCADE;
DROP TABLE IF EXISTS "__EFMigrationsHistory" CASCADE;

-- Create __EFMigrationsHistory
CREATE TABLE "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

-- Create SystemSettings
CREATE TABLE "SystemSettings" (
    "Id" uuid NOT NULL,
    "Key" character varying(100) NOT NULL,
    "Value" text NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_SystemSettings" PRIMARY KEY ("Id")
);

CREATE UNIQUE INDEX "IX_SystemSettings_Key" ON "SystemSettings" ("Key");

-- Create Users
CREATE TABLE "Users" (
    "Id" uuid NOT NULL,
    "Email" character varying(256) NOT NULL,
    "PasswordHash" text NOT NULL,
    "IsEmailVerified" boolean NOT NULL,
    "VerificationToken" text,
    "Role" character varying(50) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");

-- Create Children
CREATE TABLE "Children" (
    "Id" uuid NOT NULL,
    "ParentId" uuid NOT NULL,
    "NicknameEncrypted" character varying(512) NOT NULL,
    "Age" integer NOT NULL,
    "Gender" character varying(50) NOT NULL,
    "BaselineAttentionScore" jsonb,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Children" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Children_Users_ParentId" FOREIGN KEY ("ParentId") 
        REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_Children_ParentId" ON "Children" ("ParentId");

-- Create Subscriptions
CREATE TABLE "Subscriptions" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "PlanName" character varying(100) NOT NULL,
    "Price" numeric(18,2) NOT NULL,
    "Status" character varying(50) NOT NULL,
    "ExpiresAt" timestamp with time zone,
    "StripeSubscriptionId" character varying(255),
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Subscriptions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Subscriptions_Users_UserId" FOREIGN KEY ("UserId") 
        REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "IX_Subscriptions_UserId" ON "Subscriptions" ("UserId");

-- Create GameLogs
CREATE TABLE "GameLogs" (
    "Id" uuid NOT NULL,
    "ChildId" uuid NOT NULL,
    "GameId" character varying(100) NOT NULL,
    "Score" integer NOT NULL,
    "Duration" integer NOT NULL,
    "RawData" jsonb,
    "MRT" double precision,
    "RTV" double precision,
    "OmissionErrors" integer,
    "CommissionErrors" integer,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_GameLogs" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_GameLogs_Children_ChildId" FOREIGN KEY ("ChildId") 
        REFERENCES "Children" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_GameLogs_ChildId_CreatedAt" ON "GameLogs" ("ChildId", "CreatedAt");
CREATE INDEX "IX_GameLogs_GameId" ON "GameLogs" ("GameId");

-- Insert migration history
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260203203602_InitialCreate', '8.0.0');

-- Insert default system settings
INSERT INTO "SystemSettings" ("Id", "Key", "Value", "UpdatedAt")
VALUES
    (gen_random_uuid(), 'PremiumMonthlyPrice', '299.00', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'PremiumYearlyPrice', '2990.00', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'TrialDurationDays', '14', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'MaxChildrenPerUser', '5', CURRENT_TIMESTAMP);

-- Verify tables
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
