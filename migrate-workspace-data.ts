#!/usr/bin/env bun

import postgres from 'postgres'

const DATABASE_URL = "postgresql://postgres.wxtbrpailwudeftuynzp:Xk9%24mP7%23nQ2%40vL5%26wR8%21zT3%5EbN6@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

const sql = postgres(DATABASE_URL)

async function migrateData() {
  try {
    console.log('Migrating data from organization to workspace table...\n')

    // Copy all data from organization to workspace
    const result = await sql`
      INSERT INTO workspace (id, name, slug, logo, created_at, updated_at, metadata)
      SELECT id, name, slug, logo, created_at, updated_at, metadata
      FROM organization
      ON CONFLICT (id) DO NOTHING
      RETURNING *
    `

    console.log('✅ Migrated', result.length, 'workspace(s)')
    console.table(result)

    console.log('\nChecking workflow_folder data...\n')
    const folders = await sql`SELECT COUNT(*) as count FROM workflow_folder`
    console.log('Folders:', folders[0].count)

    console.log('\nChecking knowledge_base data...\n')
    const kb = await sql`SELECT COUNT(*) as count FROM knowledge_base`
    console.log('Knowledge bases:', kb[0].count)

  } catch (error: any) {
    console.error('Error:', error.message)
    console.error('Detail:', error.detail)
  } finally {
    await sql.end()
  }
}

migrateData()
