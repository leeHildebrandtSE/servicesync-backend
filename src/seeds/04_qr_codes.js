export const seed = async (knex) => {
  await knex('qr_codes').del();
  
  await knex('qr_codes').insert([
    {
      id: '423e4567-e89b-12d3-a456-426614174001',
      qr_code: 'KITCHEN_GH001_MAIN',
      location_type: 'kitchen',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      location_name: 'Main Kitchen - General Hospital',
      metadata: JSON.stringify({
        description: 'Main kitchen exit point'
      }),
      status: 'active'
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174002',
      qr_code: 'WARD_GH001_3A',
      location_type: 'ward',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      ward_id: '223e4567-e89b-12d3-a456-426614174001',
      location_name: 'Ward 3A Entrance',
      metadata: JSON.stringify({
        description: 'Ward 3A main entrance'
      }),
      status: 'active'
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174003',
      qr_code: 'NURSE_GH001_3A',
      location_type: 'nurse_station',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      ward_id: '223e4567-e89b-12d3-a456-426614174001',
      location_name: 'Ward 3A Nurse Station',
      metadata: JSON.stringify({
        description: 'Ward 3A nurse station'
      }),
      status: 'active'
    }
  ]);
};