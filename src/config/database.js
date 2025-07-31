import knex from 'knex';
import logger from '../utils/logger.js';

const config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'servicesync',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'servicesync123',
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './src/migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './src/seeds'
  }
};

export const db = knex(config);

export async function initializeDatabase() {
  try {
    // Test connection
    await db.raw('SELECT 1');
    logger.info('✅ Database connected successfully');
    
    // Check if migrations table exists, if not run migrations
    const hasTable = await db.schema.hasTable('knex_migrations');
    if (!hasTable) {
      logger.info('📋 Running database migrations...');
      await db.migrate.latest();
      logger.info('✅ Database migrations completed');
      
      // Check if users table has data, if not run seeds
      const userCount = await db('users').count('* as count').first();
      if (parseInt(userCount.count) === 0) {
        logger.info('🌱 Seeding initial data...');
        await db.seed.run();
        logger.info('✅ Database seeding completed');
      }
    }
    
    return db;
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    
    // If database doesn't exist, provide helpful message
    if (error.message.includes('database "servicesync" does not exist')) {
      console.log('\n🚨 DATABASE NOT FOUND!');
      console.log('📋 Please create database "servicesync" in pgAdmin 4:');
      console.log('   1. Open pgAdmin 4');
      console.log('   2. Right-click "Databases" → "Create" → "Database..."');
      console.log('   3. Database name: servicesync');
      console.log('   4. Click "Save"');
      console.log('   5. Restart the server\n');
    }
    
    throw new Error(`Database Error: ${error.message}`);
  }
}