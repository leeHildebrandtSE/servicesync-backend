export const up = async (knex) => {
  return knex.schema.createTable('nurse_notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('session_id').references('id').inTable('delivery_sessions').onDelete('CASCADE');
    table.uuid('ward_id').references('id').inTable('wards').onDelete('CASCADE');
    table.string('notification_type', 50).defaultTo('meal_arrival');
    table.string('buzzer_code', 100).nullable();
    table.timestamp('sent_at').notNullable();
    table.timestamp('acknowledged_at').nullable();
    table.string('acknowledged_by', 255).nullable();
    table.integer('response_time_seconds').nullable();
    table.enum('status', ['sent', 'acknowledged', 'expired']).defaultTo('sent');
    table.json('metadata').defaultTo('{}');
    table.timestamps(true, true);
    
    table.index(['session_id']);
    table.index(['ward_id']);
    table.index(['status']);
  });
};

export const down = async (knex) => {
  return knex.schema.dropTableIfExists('nurse_notifications');
};