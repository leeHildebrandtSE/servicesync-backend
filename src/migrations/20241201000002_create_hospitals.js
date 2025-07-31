export const up = async (knex) => {
  return knex.schema.createTable('hospitals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('hospital_id', 20).unique().notNullable();
    table.string('name', 255).notNullable();
    table.string('address', 500).nullable();
    table.string('city', 100).notNullable();
    table.string('province', 100).notNullable();
    table.string('postal_code', 10).nullable();
    table.string('phone', 20).nullable();
    table.json('settings').defaultTo('{}');
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
    
    table.index(['hospital_id']);
    table.index(['status']);
  });
};

export const down = async (knex) => {
  return knex.schema.dropTableIfExists('hospitals');
};