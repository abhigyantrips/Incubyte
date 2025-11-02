import * as fs from 'fs'
import * as path from 'path'
import pool from '../src/lib/db'

const runMigrations = async () => {
  const client = await pool.connect()

  try {
    console.log('Starting database initialization...')

    // Read and execute users table migration
    const usersMigration = fs.readFileSync(
      path.join(__dirname, '../migrations/001_create_users_table.sql'),
      'utf8',
    )
    await client.query(usersMigration)
    console.log('✓ Users table created')

    // Read and execute sweets table migration
    const sweetsMigration = fs.readFileSync(
      path.join(__dirname, '../migrations/002_create_sweets_table.sql'),
      'utf8',
    )
    await client.query(sweetsMigration)
    console.log('✓ Sweets table created')

    console.log('Database initialization completed successfully!')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()
