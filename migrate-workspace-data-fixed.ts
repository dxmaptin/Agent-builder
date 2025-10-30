#!/usr/bin/env bun

import postgres from 'postgres'

const DATABASE_URL = "postgresql://postgres.wxtbrpailwudeftuynzp:Xk9%24mP7%23nQ2%40vL5%26wR8%21zT3%5EbN6@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

const sql = postgres(DATABASE_URL)

async function migrateData() {
  try {
    console.log('Migrating data from organization to workspace table...\n')

    // Get the standalone user ID
    const userId = '4388b465-094c-4088-a12a-1e3d0f40838b'

    // Copy data from organization to workspace, mapping owner_id from user
    const result = await sql`
      INSERT INTO workspace (id, name, owner_id, created_at, updated_at)
      SELECT id, name, ${userId}, created_at, updated_at
      FROM organization
      ON CONFLICT (id) DO NOTHING
      RETURNING *
    `

    console.log('✅ Migrated', result.length, 'workspace(s)')
    console.table(result)

  } catch (error: any) {
    console.error('Error:', error.message)
    console.error('Detail:', error.detail)
  } finally {
    await sql.end()
  }
}

migrateData()
