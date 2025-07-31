export const up = async (knex) => {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('employee_id', 20).unique().notNullable();
    table.string('email', 255).unique().nullable();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.enum('role', ['hostess', 'nurse', 'admin', 'supervisor']).defaultTo('hostess');
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.string('phone', 20).nullable();
    table.json('permissions').defaultTo('[]');
    table.timestamp('last_login').nullable();
    table.timestamps(true, true);
    
    table.index(['employee_id']);
    table.index(['role']);
    table.index(['status']);
  });
};

export const down = async (knex) => {
  return knex.schema.dropTableIfExists('users');
};