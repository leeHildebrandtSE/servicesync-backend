export const up = async (knex) => {
  return knex.schema.createTable('delivery_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('session_id', 50).unique().notNullable();
    table.uuid('hostess_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('hospital_id').references('id').inTable('hospitals').onDelete('CASCADE');
    table.uuid('ward_id').references('id').inTable('wards').onDelete('CASCADE');
    
    // Meal information
    table.enum('meal_type', ['breakfast', 'lunch', 'supper', 'beverages']).notNullable();
    table.integer('meal_count').notNullable();
    table.integer('meals_served').defaultTo(0);
    
    // Timestamps for tracking
    table.timestamp('shift_start').nullable();
    table.timestamp('kitchen_exit').nullable();
    table.timestamp('ward_arrival').nullable();
    table.timestamp('diet_sheet_captured').nullable();
    table.timestamp('nurse_alerted').nullable();
    table.timestamp('nurse_response').nullable();
    table.timestamp('service_start').nullable();
    table.timestamp('service_complete').nullable();
    
    // Documentation
    table.text('comments').nullable();
    table.text('additional_notes').nullable();
    table.string('diet_sheet_photo_url').nullable();
    
    // Performance metrics
    table.integer('travel_time_seconds').nullable();
    table.integer('nurse_response_time_seconds').nullable();
    table.integer('serving_time_seconds').nullable();
    table.integer('total_duration_seconds').nullable();
    table.decimal('efficiency_score', 5, 2).nullable();
    
    // Status
    table.enum('status', ['active', 'completed', 'cancelled', 'interrupted']).defaultTo('active');
    
    table.timestamps(true, true);
    
    table.index(['session_id']);
    table.index(['hostess_id']);
    table.index(['hospital_id']);
    table.index(['ward_id']);
    table.index(['status']);
    table.index(['meal_type']);
  });
};

export const down = async (knex) => {
  return knex.schema.dropTableIfExists('delivery_sessions');
};