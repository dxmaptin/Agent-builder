#!/usr/bin/env bun

import postgres from 'postgres'

const DATABASE_URL = "postgresql://postgres.wxtbrpailwudeftuynzp:Xk9%24mP7%23nQ2%40vL5%26wR8%21zT3%5EbN6@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

const sql = postgres(DATABASE_URL)

async function checkSchema() {
  console.log('Checking workflow table columns...\n')

  const workflowColumns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'workflow'
    ORDER BY ordinal_position
  `

  console.log('workflow table columns:')
  console.table(workflowColumns)

  console.log('\nChecking workflow_folder table columns...\n')

  const folderColumns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'workflow_folder'
    ORDER BY ordinal_position
  `

  console.log('workflow_folder table columns:')
  console.table(folderColumns)

  console.log('\nChecking knowledge_base table columns...\n')

  const kbColumns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'knowledge_base'
    ORDER BY ordinal_position
  `

  console.log('knowledge_base table columns:')
  console.table(kbColumns)

  console.log('\nChecking if workflows table (plural) exists...\n')

  const workflowsExists = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'workflows'
    )
  `

  console.log('workflows table exists:', workflowsExists[0].exists)

  await sql.end()
}

checkSchema().catch(console.error)
