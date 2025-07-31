export const up = async (knex) => {
  return knex.schema.createTable('qr_codes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('qr_code', 255).unique().notNullable();
    table.enum('location_type', ['kitchen', 'ward', 'nurse_station']).notNullable();
    table.uuid('hospital_id').references('id').inTable('hospitals').onDelete('CASCADE');
    table.uuid('ward_id').references('id').inTable('wards').onDelete('CASCADE').nullable();
    table.string('location_name', 255).notNullable();
    table.json('metadata').defaultTo('{}');
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
    
    table.index(['qr_code']);
    table.index(['location_type']);
    table.index(['hospital_id']);
  });
};

export const down = async (knex) => {
  return knex.schema.dropTableIfExists('qr_codes');
};