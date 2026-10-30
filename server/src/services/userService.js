const crypto = require('crypto');
const { getDb, saveDb } = require('../db/connection');
const { isMongoConnected } = require('../db/mongo');
const User = require('../models/User');

// SQL helper utilities
function queryAll(sql, params = []) {
  try {
    const db = getDb();
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  } catch (err) {
    return [];
  }
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function runSql(sql, params = []) {
  const db = getDb();
  db.run(sql, params);
  const res = db.exec("SELECT last_insert_rowid()");
  saveDb();
  return { lastID: res[0]?.values[0]?.[0] };
}

// Token hash helper for secure session matching
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// In-memory active session cache for instant validation and revocation
const activeSessions = new Map(); // tokenHash -> { userId, expiresAt }
const revokedTokens = new Set(); // tokenHash -> revoked

class UserService {
  // Sync helper: ensure a record exists in SQLite for foreign keys in bookings / reviews
  _syncToSqlite(userData) {
    try {
      const email = userData.email ? userData.email.toLowerCase().trim() : null;
      let existing = null;
      if (email) {
        existing = queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
      } else if (userData.phone) {
        existing = queryOne('SELECT id FROM users WHERE phone = ?', [userData.phone]);
      }

      if (existing) {
        runSql(
          `UPDATE users SET full_name = ?, username = ?, phone = ?, avatar_url = ?, role = ?, is_active = ?, email_verified = ?, provider = ?, provider_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [
            userData.full_name,
            userData.username || null,
            userData.phone || null,
            userData.avatar_url || null,
            userData.role || 'customer',
            userData.is_active ? 1 : 0,
            userData.email_verified ? 1 : 0,
            userData.provider || 'local',
            userData.provider_id || null,
            existing.id
          ]
        );
        return existing.id;
      } else {
        const insertRes = runSql(
          `INSERT INTO users (email, password, full_name, username, phone, avatar_url, role, is_active, email_verified, provider, provider_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            email || `user_${Date.now()}@placeholder.tims`,
            userData.password || 'managed_external_auth',
            userData.full_name || 'Traveler',
            userData.username || null,
            userData.phone || null,
            userData.avatar_url || null,
            userData.role || 'customer',
            userData.is_active !== undefined ? (userData.is_active ? 1 : 0) : 1,
            userData.email_verified ? 1 : 0,
            userData.provider || 'local',
            userData.provider_id || null
          ]
        );
        return insertRes.lastID;
      }
    } catch (err) {
      console.warn('SQLite shadow sync note:', err.message);
      return null;
    }
  }

  // CREATE USER
  async createUser(data) {
    const cleanEmail = data.email ? data.email.toLowerCase().trim() : null;
    const cleanUsername = data.username ? data.username.toLowerCase().trim() : null;
    const cleanPhone = data.phone ? data.phone.trim() : null;

    // First create or sync in SQLite to ensure a valid numeric ID for relational bookings
    const sqliteId = this._syncToSqlite({
      ...data,
      email: cleanEmail,
      username: cleanUsername,
      phone: cleanPhone
    });

    let mongoUser = null;
    if (isMongoConnected()) {
      try {
        mongoUser = new User({
          sqlite_id: sqliteId,
          email: cleanEmail,
          password: data.password || undefined,
          full_name: data.full_name,
          username: cleanUsername,
          phone: cleanPhone,
          phone_verified: !!data.phone_verified,
          avatar_url: data.avatar_url || null,
          role: data.role || 'customer',
          is_active: data.is_active !== undefined ? data.is_active : true,
          email_verified: !!data.email_verified,
          verification_token: data.verification_token || null,
          verification_token_expires: data.verification_token_expires || null,
          provider: data.provider || 'local',
          provider_id: data.provider_id || null
        });
        await mongoUser.save();
      } catch (err) {
        console.warn('Error saving user to MongoDB:', err.message);
      }
    }

    return this.findById(sqliteId || (mongoUser && mongoUser._id));
  }

  // FIND BY EMAIL
  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected()) {
      try {
        const user = await User.findOne({ email: cleanEmail });
        if (user) return this._formatUser(user);
      } catch (err) {
        console.warn('MongoDB query error:', err.message);
      }
    }

    const row = queryOne('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
    return row ? this._formatSqlRow(row) : null;
  }

  // FIND BY PHONE
  async findByPhone(phone) {
    if (!phone) return null;
    const cleanPhone = phone.trim();

    if (isMongoConnected()) {
      try {
        const user = await User.findOne({ phone: cleanPhone });
        if (user) return this._formatUser(user);
      } catch (err) {
        console.warn('MongoDB query error:', err.message);
      }
    }

    const row = queryOne('SELECT * FROM users WHERE phone = ?', [cleanPhone]);
    return row ? this._formatSqlRow(row) : null;
  }

  // FIND BY USERNAME
  async findByUsername(username) {
    if (!username) return null;
    const cleanUsername = username.toLowerCase().trim();

    if (isMongoConnected()) {
      try {
        const user = await User.findOne({ username: cleanUsername });
        if (user) return this._formatUser(user);
      } catch (err) {
        console.warn('MongoDB query error:', err.message);
      }
    }

    const row = queryOne('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [cleanUsername]);
    return row ? this._formatSqlRow(row) : null;
  }

  // FIND BY IDENTIFIER (Email or Username)
  async findByIdentifier(identifier) {
    if (!identifier) return null;
    const clean = identifier.toLowerCase().trim();

    if (isMongoConnected()) {
      try {
        const user = await User.findOne({
          $or: [{ email: clean }, { username: clean }]
        });
        if (user) return this._formatUser(user);
      } catch (err) {
        console.warn('MongoDB query error:', err.message);
      }
    }

    const row = queryOne(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)',
      [clean, clean]
    );
    return row ? this._formatSqlRow(row) : null;
  }

  // FIND BY ID (Numeric or ObjectId)
  async findById(id) {
    if (!id) return null;

    if (isMongoConnected()) {
      try {
        let user = null;
        if (typeof id === 'number' || !isNaN(Number(id))) {
          user = await User.findOne({ sqlite_id: Number(id) });
        } else if (id.toString().match(/^[0-9a-fA-F]{24}$/)) {
          user = await User.findById(id);
        }
        if (user) return this._formatUser(user);
      } catch (err) {
        console.warn('MongoDB query error:', err.message);
      }
    }

    const row = queryOne('SELECT * FROM users WHERE id = ?', [id]);
    return row ? this._formatSqlRow(row) : null;
  }

  // FIND BY PROVIDER
  async findByProvider(provider, providerId) {
    if (!provider || !providerId) return null;

    if (isMongoConnected()) {
      try {
        const user = await User.findOne({ provider, provider_id: providerId });
        if (user) return this._formatUser(user);
      } catch (err) {
        console.warn('MongoDB query error:', err.message);
      }
    }

    const row = queryOne('SELECT * FROM users WHERE provider = ? AND provider_id = ?', [provider, providerId]);
    return row ? this._formatSqlRow(row) : null;
  }

  // FIND BY FIREBASE UID
  async findByFirebaseUid(uid) {
    if (!uid) return null;

    if (isMongoConnected()) {
      try {
        const user = await User.findOne({ firebase_uid: uid });
        if (user) return this._formatUser(user);
      } catch (err) {
        console.warn('MongoDB query error by firebase_uid:', err.message);
      }
    }

    const row = queryOne('SELECT * FROM users WHERE provider_id = ?', [uid]);
    return row ? this._formatSqlRow(row) : null;
  }


  // FIND BY RESET TOKEN
  async findByResetToken(token) {
    if (!token) return null;

    if (isMongoConnected()) {
      try {
        const user = await User.findOne({
          reset_token: token,
          reset_token_expires: { $gt: new Date() }
        });
        if (user) return this._formatUser(user);
      } catch (err) {
        console.warn('MongoDB query error:', err.message);
      }
    }

    const row = queryOne('SELECT * FROM users WHERE reset_token = ?', [token]);
    return row ? this._formatSqlRow(row) : null;
  }

  // FIND BY VERIFICATION TOKEN
  async findByVerificationToken(token, email = null) {
    if (!token) return null;

    if (isMongoConnected()) {
      try {
        const query = { verification_token: token };
        if (email) query.email = email.toLowerCase().trim();
        const user = await User.findOne(query);
        if (user) return this._formatUser(user);
      } catch (err) {
        console.warn('MongoDB query error:', err.message);
      }
    }

    let sql = 'SELECT * FROM users WHERE verification_token = ?';
    let params = [token];
    if (email) {
      sql += ' AND LOWER(email) = LOWER(?)';
      params.push(email.toLowerCase().trim());
    }
    const row = queryOne(sql, params);
    return row ? this._formatSqlRow(row) : null;
  }

  // UPDATE USER
  async updateUser(id, updateData) {
    if (!id) return null;

    if (isMongoConnected()) {
      try {
        const query = typeof id === 'number' || !isNaN(Number(id))
          ? { sqlite_id: Number(id) }
          : { _id: id };
        await User.updateOne(query, { $set: updateData });
      } catch (err) {
        console.warn('MongoDB update error:', err.message);
      }
    }

    // Mirror updates in SQLite for relational queries
    try {
      const fields = [];
      const params = [];
      if (updateData.full_name !== undefined) { fields.push('full_name = ?'); params.push(updateData.full_name); }
      if (updateData.username !== undefined) { fields.push('username = ?'); params.push(updateData.username); }
      if (updateData.phone !== undefined) { fields.push('phone = ?'); params.push(updateData.phone); }
      if (updateData.phone_verified !== undefined) { fields.push('phone_verified = ?'); params.push(updateData.phone_verified ? 1 : 0); }
      if (updateData.language !== undefined) { fields.push('language = ?'); params.push(updateData.language); }
      if (updateData.currency !== undefined) { fields.push('currency = ?'); params.push(updateData.currency); }
      if (updateData.travel_preferences !== undefined) {
        fields.push('travel_preferences = ?');
        params.push(typeof updateData.travel_preferences === 'string' ? updateData.travel_preferences : JSON.stringify(updateData.travel_preferences));
      }
      if (updateData.notification_preferences !== undefined) {
        fields.push('notification_preferences = ?');
        params.push(typeof updateData.notification_preferences === 'string' ? updateData.notification_preferences : JSON.stringify(updateData.notification_preferences));
      }
      if (updateData.avatar_url !== undefined) { fields.push('avatar_url = ?'); params.push(updateData.avatar_url); }
      if (updateData.password !== undefined) { fields.push('password = ?'); params.push(updateData.password); }
      if (updateData.role !== undefined) { fields.push('role = ?'); params.push(updateData.role); }
      if (updateData.is_active !== undefined) { fields.push('is_active = ?'); params.push(updateData.is_active ? 1 : 0); }
      if (updateData.email_verified !== undefined) { fields.push('email_verified = ?'); params.push(updateData.email_verified ? 1 : 0); }
      if (updateData.verification_token !== undefined) { fields.push('verification_token = ?'); params.push(updateData.verification_token); }
      if (updateData.reset_token !== undefined) { fields.push('reset_token = ?'); params.push(updateData.reset_token); }
      if (updateData.reset_token_expires !== undefined) {
        fields.push('reset_token_expires = ?');
        params.push(updateData.reset_token_expires ? new Date(updateData.reset_token_expires).toISOString() : null);
      }
      if (updateData.provider !== undefined) { fields.push('provider = ?'); params.push(updateData.provider); }
      if (updateData.provider_id !== undefined) { fields.push('provider_id = ?'); params.push(updateData.provider_id); }

      if (fields.length > 0) {
        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);
        runSql(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
      }
    } catch (err) {
      console.warn('SQLite update note:', err.message);
    }

    return this.findById(id);
  }

  // SESSION MANAGEMENT (Track & Invalidate Sessions)
  async addSession(userId, token, userAgent = '', ip = '', expiresInMs = 7 * 24 * 60 * 60 * 1000) {
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + expiresInMs);

    activeSessions.set(tokenHash, { userId, expiresAt });

    if (isMongoConnected()) {
      try {
        const query = typeof userId === 'number' || !isNaN(Number(userId))
          ? { sqlite_id: Number(userId) }
          : { _id: userId };
        
        await User.updateOne(query, {
          $push: {
            sessions: {
              token_hash: tokenHash,
              expires_at: expiresAt,
              user_agent: userAgent,
              ip: ip
            }
          }
        });
      } catch (err) {
        console.warn('Failed to record session in MongoDB:', err.message);
      }
    }
  }

  async removeSession(userId, token) {
    if (!token) return;
    const tokenHash = hashToken(token);
    activeSessions.delete(tokenHash);
    revokedTokens.add(tokenHash);

    if (isMongoConnected() && userId) {
      try {
        const query = typeof userId === 'number' || (!isNaN(Number(userId)) && !userId.toString().match(/^[0-9a-fA-F]{24}$/))
          ? { sqlite_id: Number(userId) }
          : { _id: userId };

        await User.updateOne(query, {
          $pull: { sessions: { token_hash: tokenHash } }
        });
      } catch (err) {
        console.warn('Failed to remove session in MongoDB:', err.message);
      }
    }
  }

  async isSessionValid(userId, token) {
    if (!token) return false;
    const tokenHash = hashToken(token);

    // If explicitly revoked via logout, reject immediately
    if (revokedTokens.has(tokenHash)) {
      return false;
    }

    // Check memory cache
    const cached = activeSessions.get(tokenHash);
    if (cached) {
      if (new Date() > cached.expiresAt) {
        activeSessions.delete(tokenHash);
        return false;
      }
      return true;
    }

    // Check MongoDB
    if (isMongoConnected() && userId) {
      try {
        const query = typeof userId === 'number' || (!isNaN(Number(userId)) && !userId.toString().match(/^[0-9a-fA-F]{24}$/))
          ? { sqlite_id: Number(userId) }
          : { _id: userId };

        const user = await User.findOne({
          ...query,
          'sessions.token_hash': tokenHash,
          'sessions.expires_at': { $gt: new Date() }
        });

        if (user) {
          activeSessions.set(tokenHash, { userId, expiresAt: new Date(Date.now() + 24 * 3600 * 1000) });
          return true;
        } else {
          // Session not in user's active sessions list in MongoDB
          return false;
        }
      } catch (err) {
        console.warn('Session verification MongoDB error:', err.message);
      }
    }

    return false;
  }

  // LIST USERS (Admin)
  async listUsers(limit = 100, skip = 0) {
    if (isMongoConnected()) {
      try {
        const docs = await User.find({})
          .sort({ created_at: -1 })
          .skip(Number(skip))
          .limit(Number(limit));
        return docs.map(doc => doc.toSafeObject());
      } catch (err) {
        console.warn('MongoDB listUsers error:', err.message);
      }
    }

    const rows = queryAll(
      'SELECT id, email, full_name, username, phone, avatar_url, role, is_active, email_verified, provider, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [Number(limit), Number(skip)]
    );
    return rows;
  }

  // Format MongoDB document
  _formatUser(doc) {
    const obj = doc.toObject();
    obj.id = obj.sqlite_id || obj._id.toString();
    return obj;
  }

  // Format SQLite row
  _formatSqlRow(row) {
    let travel_preferences = {};
    let notification_preferences = {
      booking_updates: true,
      sms_alerts: true,
      travel_reminders: true,
      promotions: false
    };

    try {
      if (row.travel_preferences) {
        travel_preferences = typeof row.travel_preferences === 'string'
          ? JSON.parse(row.travel_preferences)
          : row.travel_preferences;
      }
    } catch (e) {}

    try {
      if (row.notification_preferences) {
        notification_preferences = typeof row.notification_preferences === 'string'
          ? JSON.parse(row.notification_preferences)
          : row.notification_preferences;
      }
    } catch (e) {}

    return {
      ...row,
      id: row.id,
      sqlite_id: row.id,
      email_verified: Boolean(row.email_verified),
      phone_verified: Boolean(row.phone_verified),
      is_active: Boolean(row.is_active),
      language: row.language || 'en',
      currency: row.currency || 'USD',
      travel_preferences,
      notification_preferences
    };
  }
}

module.exports = new UserService();
