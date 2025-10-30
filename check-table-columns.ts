#!/usr/bin/env bun

import postgres from 'postgres'

const DATABASE_URL = "postgresql://postgres.wxtbrpailwudeftuynzp:Xk9%24mP7%23nQ2%40vL5%26wR8%21zT3%5EbN6@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

const sql = postgres(DATABASE_URL)

async function checkTables() {
  try {
    console.log('Checking workspace table columns...\n')
    const workspaceColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'workspace'
      ORDER BY ordinal_position
    `
    console.table(workspaceColumns)

    console.log('\nChecking organization table columns...\n')
    const orgColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'organization'
      ORDER BY ordinal_position
    `
    console.table(orgColumns)

  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    await sql.end()
  }
}

checkTables()
