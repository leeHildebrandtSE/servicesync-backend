import bcrypt from 'bcryptjs';

export class User {
  static tableName = 'users';

  static async findById(id) {
    try {
      const { db } = await import('../config/database.js');
      return await db(this.tableName).where({ id }).first();
    } catch (error) {
      console.error('User.findById error:', error.message);
      return null;
    }
  }

  static async findByEmployeeId(employeeId) {
    try {
      const { db } = await import('../config/database.js');
      return await db(this.tableName).where({ employee_id: employeeId }).first();
    } catch (error) {
      console.error('User.findByEmployeeId error:', error.message);
      return null;
    }
  }

  static async updateLastLogin(id) {
    try {
      const { db } = await import('../config/database.js');
      return await db(this.tableName)
        .where({ id })
        .update({ last_login: new Date() });
    } catch (error) {
      console.error('User.updateLastLogin error:', error.message);
      return null;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}