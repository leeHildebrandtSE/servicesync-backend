export const seed = async (knex) => {
  await knex('hospitals').del();
  
  await knex('hospitals').insert([
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      hospital_id: 'GH001',
      name: 'General Hospital - Western Cape',
      address: '123 Hospital Road',
      city: 'Cape Town',
      province: 'Western Cape',
      postal_code: '8001',
      phone: '+27-21-123-4567',
      settings: JSON.stringify({
        mealTimes: {
          breakfast: '07:00',
          lunch: '12:00',
          supper: '18:00'
        }
      }),
      status: 'active'
    }
  ]);
};