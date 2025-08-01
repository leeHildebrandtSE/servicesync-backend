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
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174004',
      qr_code: 'WARD_GH001_4B',
      location_type: 'ward',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      ward_id: '223e4567-e89b-12d3-a456-426614174002',
      location_name: 'Ward 4B Entrance',
      metadata: JSON.stringify({
        description: 'Ward 4B cardiac unit entrance'
      }),
      status: 'active'
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174005',
      qr_code: 'NURSE_GH001_4B',
      location_type: 'nurse_station',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      ward_id: '223e4567-e89b-12d3-a456-426614174002',
      location_name: 'Ward 4B Nurse Station',
      metadata: JSON.stringify({
        description: 'Ward 4B cardiac unit nurse station'
      }),
      status: 'active'
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174006',
      qr_code: 'WARD_GH001_2C',
      location_type: 'ward',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      ward_id: '223e4567-e89b-12d3-a456-426614174003',
      location_name: 'Ward 2C Entrance',
      metadata: JSON.stringify({
        description: 'Ward 2C pediatrics entrance'
      }),
      status: 'active'
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174007',
      qr_code: 'NURSE_GH001_2C',
      location_type: 'nurse_station',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      ward_id: '223e4567-e89b-12d3-a456-426614174003',
      location_name: 'Ward 2C Nurse Station',
      metadata: JSON.stringify({
        description: 'Ward 2C pediatrics nurse station'
      }),
      status: 'active'
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174008',
      qr_code: 'WARD_GH001_5A',
      location_type: 'ward',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      ward_id: '223e4567-e89b-12d3-a456-426614174004',
      location_name: 'Ward 5A Surgery Entrance',
      metadata: JSON.stringify({
        description: 'Ward 5A surgery unit entrance'
      }),
      status: 'active'
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174009',
      qr_code: 'NURSE_GH001_5A',
      location_type: 'nurse_station',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      ward_id: '223e4567-e89b-12d3-a456-426614174004',
      location_name: 'Ward 5A Surgery Nurse Station',
      metadata: JSON.stringify({
        description: 'Ward 5A surgery nurse station'
      }),
      status: 'active'
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174010',
      qr_code: 'WARD_GH001_1B',
      location_type: 'ward',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      ward_id: '223e4567-e89b-12d3-a456-426614174005',
      location_name: 'Ward 1B Emergency Entrance',
      metadata: JSON.stringify({
        description: 'Ward 1B emergency unit entrance'
      }),
      status: 'active'
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174011',
      qr_code: 'NURSE_GH001_1B',
      location_type: 'nurse_station',
      hospital_id: '123e4567-e89b-12d3-a456-426614174001',
      ward_id: '223e4567-e89b-12d3-a456-426614174005',
      location_name: 'Ward 1B Emergency Nurse Station',
      metadata: JSON.stringify({
        description: 'Ward 1B emergency nurse station'
      }),
      status: 'active'
    }
  ]);
};