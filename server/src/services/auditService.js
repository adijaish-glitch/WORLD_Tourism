const { getDb, saveDb } = require('../db/connection');

class AuditService {
  /**
   * Record security or administrative events into audit_logs
   * @param {Object} entry 
   */
  static log(entry = {}) {
    try {
      const { userId = null, action = 'SYSTEM_EVENT', ipAddress = '127.0.0.1', details = '' } = entry;
      const db = getDb();
      const detailStr = typeof details === 'object' ? JSON.stringify(details) : String(details);
      
      db.run(
        `INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)`,
        [userId, action, ipAddress, detailStr]
      );
      saveDb();
    } catch (err) {
      console.error('Audit logging error:', err);
    }
  }

  static getRecentLogs(limit = 50) {
    const db = getDb();
    const stmt = db.prepare(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?`);
    stmt.bind([Number(limit)]);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }
}

module.exports = AuditService;

