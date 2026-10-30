const { getDb, saveDb } = require('../db/connection');
const smsService = require('./smsService');
const auditService = require('./auditService');
const userService = require('./userService');
const bcrypt = require('bcryptjs');

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
    console.error('SQL query error:', err.message);
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

// Ensure userId resolves to the numeric SQLite ID across all hybrid schemas
function resolveUserId(userId) {
  if (typeof userId === 'number') return userId;
  if (!userId) return null;
  if (!isNaN(Number(userId))) return Number(userId);
  const row = queryOne('SELECT id FROM users WHERE id = ? OR provider_id = ?', [userId, userId]);
  if (row) return row.id;
  return Number(userId) || null;
}

// In-memory phone verification cache: userId -> { phone, otpHash, expiresAt, attempts }
const phoneVerificationCache = new Map();

class AccountService {
  // ==========================================
  // 1. WISHLIST & SAVED PLACES
  // ==========================================

  getWishlist(userId) {
    const uid = resolveUserId(userId);
    return queryAll(
      'SELECT * FROM wishlist_items WHERE user_id = ? ORDER BY created_at DESC',
      [uid]
    );
  }

  isInWishlist(userId, itemType, itemId) {
    const uid = resolveUserId(userId);
    const row = queryOne(
      'SELECT id FROM wishlist_items WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [uid, itemType, itemId]
    );
    return !!row;
  }

  addToWishlist(userId, item) {
    const uid = resolveUserId(userId);
    const existing = queryOne(
      'SELECT id FROM wishlist_items WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [uid, item.item_type, item.item_id]
    );
    if (existing) {
      return { success: true, message: 'Item already in wishlist', id: existing.id };
    }

    const res = runSql(
      `INSERT INTO wishlist_items (user_id, item_type, item_id, title, subtitle, image_url, price, rating, link_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uid,
        item.item_type,
        item.item_id,
        item.title || 'Saved Place',
        item.subtitle || null,
        item.image_url || null,
        item.price !== undefined ? Number(item.price) : null,
        item.rating !== undefined ? Number(item.rating) : null,
        item.link_url || null
      ]
    );

    return { success: true, id: res.lastID, message: 'Added to wishlist' };
  }

  removeFromWishlist(userId, wishlistId) {
    const uid = resolveUserId(userId);
    runSql('DELETE FROM wishlist_items WHERE id = ? AND user_id = ?', [wishlistId, uid]);
    return { success: true, message: 'Removed from wishlist' };
  }

  // ==========================================
  // 2. SAVED TRAVELLERS
  // ==========================================

  getTravellers(userId) {
    const uid = resolveUserId(userId);
    return queryAll(
      'SELECT * FROM saved_travellers WHERE user_id = ? ORDER BY is_primary DESC, created_at ASC',
      [uid]
    );
  }

  getTravellerById(userId, travellerId) {
    const uid = resolveUserId(userId);
    return queryOne(
      'SELECT * FROM saved_travellers WHERE id = ? AND user_id = ?',
      [travellerId, uid]
    );
  }

  addTraveller(userId, data) {
    const uid = resolveUserId(userId);
    const firstName = data.first_name ? data.first_name.trim() : '';
    const lastName = data.last_name ? data.last_name.trim() : '';
    if (!firstName || !lastName) {
      throw new Error('First and last name are required for saved traveller profile');
    }

    // If marked as primary, reset other primary flags
    if (data.is_primary) {
      runSql('UPDATE saved_travellers SET is_primary = 0 WHERE user_id = ?', [uid]);
    }

    const res = runSql(
      `INSERT INTO saved_travellers (user_id, first_name, last_name, date_of_birth, gender, phone, email, traveler_type, meal_or_dietary, special_assistance, is_primary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uid,
        firstName,
        lastName,
        data.date_of_birth || null,
        data.gender || 'unspecified',
        data.phone ? data.phone.trim() : null,
        data.email ? data.email.trim().toLowerCase() : null,
        data.traveler_type || 'adult',
        data.meal_or_dietary || null,
        data.special_assistance || null,
        data.is_primary ? 1 : 0
      ]
    );

    return this.getTravellerById(uid, res.lastID);
  }

  updateTraveller(userId, travellerId, data) {
    const uid = resolveUserId(userId);
    const existing = this.getTravellerById(uid, travellerId);
    if (!existing) {
      throw new Error('Traveller profile not found or access denied');
    }

    if (data.is_primary) {
      runSql('UPDATE saved_travellers SET is_primary = 0 WHERE user_id = ?', [uid]);
    }

    const fields = [];
    const params = [];

    if (data.first_name !== undefined) { fields.push('first_name = ?'); params.push(data.first_name.trim()); }
    if (data.last_name !== undefined) { fields.push('last_name = ?'); params.push(data.last_name.trim()); }
    if (data.date_of_birth !== undefined) { fields.push('date_of_birth = ?'); params.push(data.date_of_birth); }
    if (data.gender !== undefined) { fields.push('gender = ?'); params.push(data.gender); }
    if (data.phone !== undefined) { fields.push('phone = ?'); params.push(data.phone ? data.phone.trim() : null); }
    if (data.email !== undefined) { fields.push('email = ?'); params.push(data.email ? data.email.trim().toLowerCase() : null); }
    if (data.traveler_type !== undefined) { fields.push('traveler_type = ?'); params.push(data.traveler_type); }
    if (data.meal_or_dietary !== undefined) { fields.push('meal_or_dietary = ?'); params.push(data.meal_or_dietary); }
    if (data.special_assistance !== undefined) { fields.push('special_assistance = ?'); params.push(data.special_assistance); }
    if (data.is_primary !== undefined) { fields.push('is_primary = ?'); params.push(data.is_primary ? 1 : 0); }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(travellerId, uid);
      runSql(`UPDATE saved_travellers SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, params);
    }

    return this.getTravellerById(uid, travellerId);
  }

  deleteTraveller(userId, travellerId) {
    const uid = resolveUserId(userId);
    const existing = this.getTravellerById(uid, travellerId);
    if (!existing) {
      throw new Error('Traveller profile not found or access denied');
    }
    runSql('DELETE FROM saved_travellers WHERE id = ? AND user_id = ?', [travellerId, uid]);
    return { success: true, message: 'Traveller deleted successfully' };
  }

  // ==========================================
  // 3. SUPPORT TICKETS & REPLIES
  // ==========================================

  getTickets(userId, isAdmin = false) {
    if (isAdmin) {
      return queryAll(`
        SELECT st.*, u.full_name as user_name, u.email as user_email
        FROM support_tickets st
        LEFT JOIN users u ON st.user_id = u.id
        ORDER BY
          CASE st.status
            WHEN 'open' THEN 1
            WHEN 'in_progress' THEN 2
            WHEN 'awaiting_user_response' THEN 3
            ELSE 4
          END,
          st.created_at DESC
      `);
    }

    const uid = resolveUserId(userId);
    return queryAll(
      'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
      [uid]
    );
  }

  getTicketDetails(ticketId, userId, isAdmin = false) {
    let ticket = null;
    if (isAdmin) {
      ticket = queryOne(`
        SELECT st.*, u.full_name as user_name, u.email as user_email
        FROM support_tickets st
        LEFT JOIN users u ON st.user_id = u.id
        WHERE st.id = ?
      `, [ticketId]);
    } else {
      const uid = resolveUserId(userId);
      ticket = queryOne('SELECT * FROM support_tickets WHERE id = ? AND user_id = ?', [ticketId, uid]);
    }

    if (!ticket) return null;

    const messages = queryAll(
      'SELECT * FROM support_messages WHERE ticket_id = ? ORDER BY created_at ASC',
      [ticketId]
    );

    return {
      ticket,
      messages
    };
  }

  createTicket(userId, data, userDetails) {
    const uid = resolveUserId(userId);
    const { category, subject, message, booking_reference, priority = 'normal' } = data;
    if (!category || !subject || !message) {
      throw new Error('Category, subject, and detailed message are required');
    }

    // Generate unique human-readable ticket number (e.g. TIMS-TKT-82941)
    const ticketNumber = `TIMS-TKT-${Date.now().toString().slice(-5)}${Math.floor(10 + Math.random() * 90)}`;

    const res = runSql(
      `INSERT INTO support_tickets (user_id, ticket_number, category, subject, message, booking_reference, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        uid,
        ticketNumber,
        category,
        subject.trim(),
        message.trim(),
        booking_reference ? booking_reference.trim() : null,
        priority
      ]
    );

    const ticketId = res.lastID;

    // Insert first customer message into support_messages thread
    runSql(
      `INSERT INTO support_messages (ticket_id, sender_type, sender_id, sender_name, message)
       VALUES (?, 'user', ?, ?, ?)`,
      [
        ticketId,
        uid,
        userDetails?.full_name || 'Traveler',
        message.trim()
      ]
    );

    // Create system notification for traveler
    this.createNotification(uid, {
      type: 'system',
      title: 'Support Request Received',
      body: `Your ticket #${ticketNumber} "${subject.trim().slice(0, 40)}" has been logged. Our concierge team will review it shortly.`,
      link_url: '/profile?tab=support'
    });

    return this.getTicketDetails(ticketId, uid, false);
  }

  replyToTicket(ticketId, userId, senderName, senderType, message, newStatus = null, isAdmin = false) {
    const uid = resolveUserId(userId);
    const ticket = isAdmin
      ? queryOne('SELECT * FROM support_tickets WHERE id = ?', [ticketId])
      : queryOne('SELECT * FROM support_tickets WHERE id = ? AND user_id = ?', [ticketId, uid]);

    if (!ticket) {
      throw new Error('Support ticket not found or access denied');
    }

    runSql(
      `INSERT INTO support_messages (ticket_id, sender_type, sender_id, sender_name, message)
       VALUES (?, ?, ?, ?, ?)`,
      [ticketId, senderType, uid, senderName, message.trim()]
    );

    let statusToSet = newStatus;
    if (!statusToSet) {
      statusToSet = (senderType === 'support') ? 'awaiting_user_response' : 'in_progress';
    }

    runSql(
      'UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [statusToSet, ticketId]
    );

    // If support replied, notify the customer
    if (senderType === 'support' && ticket.user_id) {
      this.createNotification(ticket.user_id, {
        type: 'system',
        title: `Reply on Ticket #${ticket.ticket_number}`,
        body: `Support team has replied to your request: "${message.trim().slice(0, 60)}..."`,
        link_url: '/profile?tab=support'
      });
    }

    return this.getTicketDetails(ticketId, uid, isAdmin);
  }

  updateTicketStatus(ticketId, status, updatedByAdmin = false, userId = null) {
    const allowed = ['open', 'in_progress', 'awaiting_user_response', 'resolved', 'closed'];
    if (!allowed.includes(status)) {
      throw new Error('Invalid ticket status');
    }

    const uid = resolveUserId(userId);
    const ticket = updatedByAdmin
      ? queryOne('SELECT * FROM support_tickets WHERE id = ?', [ticketId])
      : queryOne('SELECT * FROM support_tickets WHERE id = ? AND user_id = ?', [ticketId, uid]);

    if (!ticket) {
      throw new Error('Ticket not found or permission denied');
    }

    runSql(
      'UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, ticketId]
    );

    return { success: true, status, message: `Ticket status updated to ${status}` };
  }

  // ==========================================
  // 4. NOTIFICATIONS & PREFERENCES
  // ==========================================

  getNotifications(userId) {
    const uid = resolveUserId(userId);
    return queryAll(
      'SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [uid]
    );
  }

  markNotificationRead(userId, notificationId) {
    const uid = resolveUserId(userId);
    if (notificationId === 'all') {
      runSql('UPDATE user_notifications SET is_read = 1 WHERE user_id = ?', [uid]);
      return { success: true, message: 'All notifications marked as read' };
    }
    runSql('UPDATE user_notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notificationId, uid]);
    return { success: true, message: 'Notification marked as read' };
  }

  createNotification(userId, { type, title, body, link_url }) {
    const uid = resolveUserId(userId);
    if (!uid) return null;
    const res = runSql(
      `INSERT INTO user_notifications (user_id, type, title, body, link_url)
       VALUES (?, ?, ?, ?, ?)`,
      [uid, type || 'system', title, body, link_url || null]
    );
    return res.lastID;
  }

  // ==========================================
  // 5. PHONE VERIFICATION VIA TWILIO OTP
  // ==========================================

  async sendPhoneVerificationOtp(userId, phone) {
    const uid = resolveUserId(userId);
    if (!phone) {
      throw new Error('Valid phone number is required');
    }

    // Clean and check format
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 16) {
      throw new Error('Please enter a valid phone number with country code (e.g., +15552345678)');
    }

    // Rate limit checks (max 1 request per 30 seconds per user)
    const cached = phoneVerificationCache.get(uid);
    if (cached && (Date.now() - cached.timestamp < 30000)) {
      throw new Error('Please wait 30 seconds before requesting another code');
    }

    const otpResult = await smsService.sendOtp(cleanPhone);

    phoneVerificationCache.set(uid, {
      phone: cleanPhone,
      otpHash: otpResult.otpHash,
      expiresAt: otpResult.expiresAt,
      timestamp: Date.now(),
      attempts: 0
    });

    return {
      message: `Verification code sent to ${cleanPhone}`,
      phone: cleanPhone,
      deliveredViaTwilio: otpResult.deliveredViaTwilio,
      devCode: otpResult.devCode
    };
  }

  async verifyPhoneOtp(userId, phone, otp) {
    const uid = resolveUserId(userId);
    if (!phone || !otp) {
      throw new Error('Phone number and verification code are required');
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const cached = phoneVerificationCache.get(uid);

    if (!cached || cached.phone !== cleanPhone) {
      throw new Error('No active verification code found for this phone number. Please request a new code.');
    }

    cached.attempts = (cached.attempts || 0) + 1;
    const verification = smsService.verifyOtp(otp, cached.otpHash, cached.expiresAt, cached.attempts);

    if (!verification.valid) {
      throw new Error(verification.error || 'Invalid code');
    }

    phoneVerificationCache.delete(uid);

    // Update user profile across MongoDB and SQLite
    await userService.updateUser(uid, {
      phone: cleanPhone,
      phone_verified: true
    });

    // Send confirmation SMS & Notification
    smsService.sendSecurityAlert(cleanPhone, 'Phone number verified for TIMS Travel Profile');
    this.createNotification(uid, {
      type: 'security',
      title: 'Phone Verified',
      body: `Your phone number ${cleanPhone} has been securely verified via SMS.`,
      link_url: '/profile?tab=security'
    });

    return {
      success: true,
      phone: cleanPhone,
      phone_verified: true,
      message: 'Phone number verified successfully'
    };
  }

  // ==========================================
  // 6. LOGIN & SECURITY OVERVIEW & DELETION
  // ==========================================

  getSecurityOverview(user) {
    return {
      provider: user.provider || 'local',
      isGoogleConnected: user.provider === 'google' || !!user.provider_id,
      email: user.email,
      email_verified: Boolean(user.email_verified),
      phone: user.phone || null,
      phone_verified: Boolean(user.phone_verified),
      hasPassword: Boolean(user.password && user.provider === 'local'),
      created_at: user.created_at,
      twoFactorStatus: 'SMS OTP (On Demand)'
    };
  }

  async requestAccountDeletion(userId, user, passwordConfirmation = null) {
    // If local password account, require correct password
    if (user.provider === 'local' && user.password) {
      if (!passwordConfirmation) {
        throw new Error('Password confirmation is required to delete this account');
      }
      const match = await bcrypt.compare(passwordConfirmation, user.password);
      if (!match) {
        throw new Error('Password incorrect. Account deletion aborted.');
      }
    }

    // 1. Delete user-owned disposable data (wishlists, saved travellers, notifications)
    runSql('DELETE FROM wishlist_items WHERE user_id = ?', [userId]);
    runSql('DELETE FROM saved_travellers WHERE user_id = ?', [userId]);
    runSql('DELETE FROM user_notifications WHERE user_id = ?', [userId]);

    // 2. Anonymize user record while keeping relational booking consistency for audits (Section 13 requirement)
    const anonymizedEmail = `deleted_user_${userId}_${Date.now()}@tims.anonymized`;
    runSql(
      `UPDATE users
       SET email = ?,
           full_name = 'Deactivated Traveler',
           username = NULL,
           phone = NULL,
           password = 'DEACTIVATED_ACCOUNT',
           is_active = 0,
           avatar_url = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [anonymizedEmail, userId]
    );

    auditService.recordAudit(userId, 'ACCOUNT_DEACTIVATED_BY_USER', '127.0.0.1', 'User requested full GDPR/privacy account deactivation');

    return {
      success: true,
      message: 'Your account has been deactivated and personal preferences removed in compliance with data privacy standards.'
    };
  }
}

module.exports = new AccountService();
