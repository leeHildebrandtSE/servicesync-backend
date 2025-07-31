export const seed = async (knex) => {
  await knex('wards').del();
  
  await knex('wards').insert([
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      ward_id: '3A',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Ward 3A - General Medicine',
      ward_type: 'General Medicine',
      bed_capacity: 32,
      floor: '3',
      wing: 'A',
      nurse_station_buzzer: 'BUZZ_3A_001',
      dietary_requirements: JSON.stringify({
        diabetic: 8,
        lowSodium: 5,
        vegetarian: 3
      }),
      status: 'active'
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174002',
      ward_id: '4B',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Ward 4B - Cardiac Unit',
      ward_type: 'Cardiac',
      bed_capacity: 24,
      floor: '4',
      wing: 'B',
      nurse_station_buzzer: 'BUZZ_4B_001',
      status: 'active'
    }
  ]);
};