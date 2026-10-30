const accountService = require('../services/accountService');
const userService = require('../services/userService');
const smsService = require('../services/smsService');
const bcrypt = require('bcryptjs');

// Sanitizer for user object
function sanitizeUser(user) {
  if (!user) return null;
  const safe = { ...user };
  delete safe.password;
  delete safe.phone_otp_hash;
  delete safe.verification_token;
  delete safe.reset_token;
  delete safe.sessions;
  return safe;
}

// ==========================================
// 1. PROFILE & PREFERENCES
// ==========================================

exports.getProfile = async (req, res) => {
  try {
    const user = await userService.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      username,
      avatar_url,
      language,
      currency,
      travel_preferences,
      notification_preferences
    } = req.body;

    const user = await userService.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateData = {};

    if (full_name !== undefined) {
      if (!full_name || !full_name.trim()) {
        return res.status(400).json({ error: 'Full name cannot be blank' });
      }
      updateData.full_name = full_name.trim();
    }

    if (username !== undefined) {
      const cleanUsername = username ? username.trim().toLowerCase() : null;
      if (cleanUsername) {
        const existing = await userService.findByUsername(cleanUsername);
        if (existing && existing.id !== user.id) {
          return res.status(409).json({ error: 'This username is already taken' });
        }
        updateData.username = cleanUsername;
      } else {
        updateData.username = null;
      }
    }

    if (avatar_url !== undefined) updateData.avatar_url = avatar_url || null;
    if (language !== undefined) updateData.language = language || 'en';
    if (currency !== undefined) updateData.currency = currency || 'USD';
    if (travel_preferences !== undefined) updateData.travel_preferences = travel_preferences;
    if (notification_preferences !== undefined) updateData.notification_preferences = notification_preferences;

    // Never allow overwriting a verified Google OAuth email arbitrarily through profile update
    if (req.body.email && req.body.email !== user.email) {
      return res.status(400).json({
        error: 'Email address cannot be changed directly in profile settings to protect authentication integrity.'
      });
    }

    const updated = await userService.updateUser(userId, updateData);
    res.json({
      user: sanitizeUser(updated),
      message: 'Profile updated successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 2. PHONE VERIFICATION VIA TWILIO OTP
// ==========================================

exports.sendPhoneOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone } = req.body;
    const result = await accountService.sendPhoneVerificationOtp(userId, phone);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.verifyPhoneOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, otp } = req.body;
    const result = await accountService.verifyPhoneOtp(userId, phone, otp);
    const updatedUser = await userService.findById(userId);
    res.json({
      ...result,
      user: sanitizeUser(updatedUser)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ==========================================
// 3. WISHLIST & SAVED PLACES
// ==========================================

exports.getWishlist = async (req, res) => {
  try {
    const items = accountService.getWishlist(req.user.id);
    res.json({ wishlist: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { item_type, item_id, title, subtitle, image_url, price, rating, link_url } = req.body;
    if (!item_type || !item_id || !title) {
      return res.status(400).json({ error: 'item_type, item_id, and title are required' });
    }
    const result = accountService.addToWishlist(req.user.id, {
      item_type,
      item_id,
      title,
      subtitle,
      image_url,
      price,
      rating,
      link_url
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const result = accountService.removeFromWishlist(req.user.id, Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 4. SAVED TRAVELLERS
// ==========================================

exports.getTravellers = async (req, res) => {
  try {
    const travellers = accountService.getTravellers(req.user.id);
    res.json({ travellers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addTraveller = async (req, res) => {
  try {
    const traveller = accountService.addTraveller(req.user.id, req.body);
    res.status(201).json({ traveller, message: 'Traveller added successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTraveller = async (req, res) => {
  try {
    const traveller = accountService.updateTraveller(req.user.id, Number(req.params.id), req.body);
    res.json({ traveller, message: 'Traveller profile updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTraveller = async (req, res) => {
  try {
    const result = accountService.deleteTraveller(req.user.id, Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ==========================================
// 5. LOGIN & SECURITY
// ==========================================

exports.getSecurityOverview = async (req, res) => {
  try {
    const user = await userService.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const overview = accountService.getSecurityOverview(user);
    res.json({ security: overview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    const user = await userService.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.provider !== 'local' || !user.password) {
      return res.status(400).json({
        error: `Your account uses ${user.provider || 'external'} authentication. Password management is not applicable.`
      });
    }

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const valid = await bcrypt.compare(current_password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await userService.updateUser(userId, { password: hashedPassword });

    if (user.phone) {
      smsService.sendSecurityAlert(user.phone, 'Password updated via Traveler Security settings');
    }

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userService.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = await accountService.requestAccountDeletion(userId, user, req.body.password_confirmation);

    // Clear session cookies
    res.clearCookie('token');
    res.clearCookie('tims_token');
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ==========================================
// 6. NOTIFICATIONS
// ==========================================

exports.getNotifications = async (req, res) => {
  try {
    const notifications = accountService.getNotifications(req.user.id);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const result = accountService.markNotificationRead(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 7. SUPPORT TICKETS
// ==========================================

exports.getTickets = async (req, res) => {
  try {
    const tickets = accountService.getTickets(req.user.id, false);
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketDetails = async (req, res) => {
  try {
    const details = accountService.getTicketDetails(Number(req.params.id), req.user.id, false);
    if (!details) return res.status(404).json({ error: 'Ticket not found' });
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const user = await userService.findById(req.user.id);
    const details = accountService.createTicket(req.user.id, req.body, user);
    res.status(201).json({ ticket: details.ticket, messages: details.messages, message: 'Ticket created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.replyToTicket = async (req, res) => {
  try {
    const user = await userService.findById(req.user.id);
    const details = accountService.replyToTicket(
      Number(req.params.id),
      req.user.id,
      user?.full_name || 'Traveler',
      'user',
      req.body.message,
      req.body.status || null,
      false
    );
    res.json(details);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const result = accountService.updateTicketStatus(
      Number(req.params.id),
      req.body.status,
      false,
      req.user.id
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ==========================================
// 8. ADMIN SUPPORT MANAGEMENT
// ==========================================

exports.adminListTickets = async (req, res) => {
  try {
    const tickets = accountService.getTickets(null, true);
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.adminGetTicket = async (req, res) => {
  try {
    const details = accountService.getTicketDetails(Number(req.params.id), null, true);
    if (!details) return res.status(404).json({ error: 'Ticket not found' });
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.adminReplyTicket = async (req, res) => {
  try {
    const adminUser = await userService.findById(req.user.id);
    const details = accountService.replyToTicket(
      Number(req.params.id),
      req.user.id,
      `Support Concierge (${adminUser?.full_name || 'Agent'})`,
      'support',
      req.body.message,
      req.body.status || 'awaiting_user_response',
      true
    );
    res.json(details);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.adminUpdateTicketStatus = async (req, res) => {
  try {
    const result = accountService.updateTicketStatus(
      Number(req.params.id),
      req.body.status,
      true,
      null
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
