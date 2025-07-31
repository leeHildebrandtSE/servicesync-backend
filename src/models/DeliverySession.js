export class DeliverySession {
  static tableName = 'delivery_sessions';

  static async create(sessionData) {
    try {
      const { db } = await import('../config/database.js');
      const sessionId = `SS${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const [session] = await db(this.tableName)
        .insert({
          session_id: sessionId,
          hostess_id: sessionData.hostessId,
          hospital_id: sessionData.hospitalId,
          ward_id: sessionData.wardId,
          meal_type: sessionData.mealType,
          meal_count: sessionData.mealCount,
          shift_start: new Date()
        })
        .returning('*');
      
      return session;
    } catch (error) {
      console.error('DeliverySession.create error:', error.message);
      throw error;
    }
  }

  static async findBySessionId(sessionId) {
    try {
      const { db } = await import('../config/database.js');
      return await db(this.tableName)
        .where('session_id', sessionId)
        .first();
    } catch (error) {
      console.error('DeliverySession.findBySessionId error:', error.message);
      return null;
    }
  }

  static async updateTimestamp(sessionId, timestampField, timestamp = new Date()) {
    try {
      const { db } = await import('../config/database.js');
      return await db(this.tableName)
        .where({ session_id: sessionId })
        .update({ [timestampField]: timestamp });
    } catch (error) {
      console.error('DeliverySession.updateTimestamp error:', error.message);
      return null;
    }
  }
}