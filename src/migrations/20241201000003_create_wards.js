export const up = async (knex) => {
  return knex.schema.createTable('wards', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('ward_id', 20).notNullable();
    table.uuid('hospital_id').references('id').inTable('hospitals').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('ward_type', 100).nullable();
    table.integer('bed_capacity').defaultTo(0);
    table.string('floor', 10).nullable();
    table.string('wing', 50).nullable();
    table.json('dietary_requirements').defaultTo('{}');
    table.string('nurse_station_buzzer', 100).nullable();
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
    
    table.unique(['hospital_id', 'ward_id']);
    table.index(['hospital_id']);
    table.index(['ward_id']);
  });
};

export const down = async (knex) => {
  return knex.schema.dropTableIfExists('wards');
};