-- ============================================
-- MINIMAL DATABASE SCHEMA FOR STANDALONE MODE
-- ============================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query

-- 1. User table (required for authentication)
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "email_verified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "stripe_customer_id" TEXT
);

-- 2. Organization (workspace) table
CREATE TABLE IF NOT EXISTS "organization" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "slug" TEXT,
  "logo" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "metadata" JSONB
);

-- 3. Member table (links users to organizations)
CREATE TABLE IF NOT EXISTS "member" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organization_id" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL DEFAULT 'member',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("organization_id", "user_id")
);

-- 4. Session table (optional but recommended)
CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "expires_at" TIMESTAMP NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "ip_address" TEXT,
  "user_agent" TEXT,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "active_organization_id" TEXT REFERENCES "organization"("id") ON DELETE SET NULL
);

-- 5. Account table (for OAuth providers - optional)
CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "id_token" TEXT,
  "access_token_expires_at" TIMESTAMP,
  "refresh_token_expires_at" TIMESTAMP,
  "scope" TEXT,
  "password" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Workflows table (core functionality)
CREATE TABLE IF NOT EXISTS "workflows" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "organization_id" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "blocks" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "edges" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_member_user_id" ON "member"("user_id");
CREATE INDEX IF NOT EXISTS "idx_member_org_id" ON "member"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_session_user_id" ON "session"("user_id");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "session"("token");
CREATE INDEX IF NOT EXISTS "idx_workflows_org_id" ON "workflows"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_workflows_user_id" ON "workflows"("user_id");

-- Success message
SELECT 'Database schema created successfully! ✅' AS status;
