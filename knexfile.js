import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'servicesync',
      user: 'postgres',
      password: 'servicesync123',
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './src/migrations',
      tableName: 'knex_migrations'
    },
    seeds: { directory: './src/seeds' }
  }
};