#!/usr/bin/env bun

import postgres from 'postgres'

const DATABASE_URL = "postgresql://postgres.wxtbrpailwudeftuynzp:Xk9%24mP7%23nQ2%40vL5%26wR8%21zT3%5EbN6@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

const sql = postgres(DATABASE_URL)

async function checkWorkspace() {
  try {
    console.log('Checking workspace table...\n')

    const workspaces = await sql`
      SELECT * FROM workspace WHERE id = 'e2cfa967-e9c5-47ef-8611-96e824769280'
    `

    console.log('Workspaces found:', workspaces.length)
    if (workspaces.length > 0) {
      console.log('Workspace:', workspaces[0])
    }

    console.log('\nChecking all workspaces...\n')
    const allWorkspaces = await sql`SELECT id, name FROM workspace`
    console.table(allWorkspaces)

    console.log('\nChecking user...\n')
    const users = await sql`
      SELECT * FROM "user" WHERE id = '4388b465-094c-4088-a12a-1e3d0f40838b'
    `
    console.log('User found:', users.length > 0)
    if (users.length > 0) {
      console.log('User:', users[0])
    }

    console.log('\nChecking organization table (if it exists)...\n')
    try {
      const orgs = await sql`SELECT id, name FROM organization`
      console.table(orgs)
    } catch (e: any) {
      console.log('Organization table does not exist:', e.message)
    }

  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    await sql.end()
  }
}

checkWorkspace()
