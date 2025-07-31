import bcrypt from 'bcryptjs';

export const seed = async (knex) => {
  await knex('users').del();
  
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  await knex('users').insert([
    {
      id: '323e4567-e89b-12d3-a456-426614174001',
      employee_id: 'H001',
      email: 'sarah.johnson@hospital.com',
      password_hash: hashedPassword,
      first_name: 'Sarah',
      last_name: 'Johnson',
      role: 'hostess',
      phone: '+27-82-123-4567',
      permissions: JSON.stringify(['meal_delivery', 'qr_scanning']),
      status: 'active'
    },
    {
      id: '323e4567-e89b-12d3-a456-426614174002',
      employee_id: 'H002',
      email: 'mary.smith@hospital.com',
      password_hash: hashedPassword,
      first_name: 'Mary',
      last_name: 'Smith',
      role: 'hostess',
      phone: '+27-82-234-5678',
      permissions: JSON.stringify(['meal_delivery', 'qr_scanning']),
      status: 'active'
    },
    {
      id: '323e4567-e89b-12d3-a456-426614174003',
      employee_id: 'N001',
      email: 'mary.williams@hospital.com',
      password_hash: hashedPassword,
      first_name: 'Mary',
      last_name: 'Williams',
      role: 'nurse',
      phone: '+27-82-345-6789',
      permissions: JSON.stringify(['meal_acknowledgment']),
      status: 'active'
    },
    {
      id: '323e4567-e89b-12d3-a456-426614174004',
      employee_id: 'ADMIN001',
      email: 'admin@hospital.com',
      password_hash: hashedPassword,
      first_name: 'Hospital',
      last_name: 'Administrator',
      role: 'admin',
      phone: '+27-82-456-7890',
      permissions: JSON.stringify(['all']),
      status: 'active'
    }
  ]);
};