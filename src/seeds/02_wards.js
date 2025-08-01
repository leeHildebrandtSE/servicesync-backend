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
      dietary_requirements: JSON.stringify({
        lowSodium: 18,
        diabetic: 12,
        heartHealthy: 20
      }),
      status: 'active'
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174003',
      ward_id: '2C',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Ward 2C - Pediatrics',
      ward_type: 'Pediatrics',
      bed_capacity: 20,
      floor: '2',
      wing: 'C',
      nurse_station_buzzer: 'BUZZ_2C_001',
      dietary_requirements: JSON.stringify({
        childPortions: 20,
        allergySafe: 15,
        softFoods: 8
      }),
      status: 'active'
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174004',
      ward_id: '5A',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Ward 5A - Surgery',
      ward_type: 'Surgery',
      bed_capacity: 28,
      floor: '5',
      wing: 'A',
      nurse_station_buzzer: 'BUZZ_5A_001',
      dietary_requirements: JSON.stringify({
        postSurgical: 15,
        liquidDiet: 8,
        softFoods: 12
      }),
      status: 'active'
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174005',
      ward_id: '1B',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Ward 1B - Emergency',
      ward_type: 'Emergency',
      bed_capacity: 16,
      floor: '1',
      wing: 'B',
      nurse_station_buzzer: 'BUZZ_1B_001',
      dietary_requirements: JSON.stringify({
        rapidService: 16,
        specialDiet: 5
      }),
      status: 'active'
    }
  ]);
};