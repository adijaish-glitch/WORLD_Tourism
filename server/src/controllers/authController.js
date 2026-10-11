const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getDb, saveDb } = require('../db/connection');
const { generateToken } = require('../middleware/auth');

// Helper to run queries with sql.js
function queryAll(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  const db = getDb();
  db.run(sql, params);
  saveDb();
  return { lastID: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] };
}

// 1. REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password, full_name, username, phone, avatar_url } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Full name, email address, and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const existingEmail = queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    if (username) {
      const existingUsername = queryOne('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [username]);
      if (existingUsername) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
    }

    // Generate random 6-character verification code or token
    const verificationToken = crypto.randomBytes(16).toString('hex');
    const hashed = await bcrypt.hash(password, 10);

    run(
      `INSERT INTO users (email, password, full_name, username, phone, avatar_url, email_verified, verification_token, provider)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'local')`,
      [
        email.toLowerCase().trim(),
        hashed,
        full_name.trim(),
        username ? username.trim() : null,
        phone || null,
        avatar_url || null,
        verificationToken
      ]
    );

    const user = queryOne(
      'SELECT id, email, role, full_name, username, phone, avatar_url, email_verified, provider, created_at FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    const token = generateToken(user, '7d');

    res.status(201).json({
      user,
      token,
      verificationToken,
      message: 'Account created successfully! Verification code has been sent.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. LOGIN (Email OR Username, Password Toggle, Remember Me)
exports.login = async (req, res) => {
  try {
    const { email, username, identifier, password, remember_me } = req.body;
    const loginIdentifier = identifier || email || username;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    const cleanId = loginIdentifier.toLowerCase().trim();
    const user = queryOne(
      'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?',
      [cleanId, cleanId]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Please contact support.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    // Set duration based on Remember Me
    const tokenDuration = remember_me ? '30d' : '24h';
    const token = generateToken(user, tokenDuration);

    const { password: _, verification_token: __, reset_token: ___, ...safeUser } = user;

    res.json({
      user: safeUser,
      token,
      message: 'Signed in successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. EMAIL VERIFICATION
exports.verifyEmail = (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    let user;
    if (email) {
      user = queryOne('SELECT id, email_verified FROM users WHERE LOWER(email) = LOWER(?) AND verification_token = ?', [email, token]);
    } else {
      user = queryOne('SELECT id, email_verified FROM users WHERE verification_token = ?', [token]);
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    run('UPDATE users SET email_verified = 1, verification_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const updatedUser = queryOne('SELECT id, email, role, full_name, username, phone, avatar_url, email_verified FROM users WHERE id = ?', [user.id]);
    res.json({ success: true, user: updatedUser, message: 'Email verified successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. RESEND VERIFICATION
exports.resendVerification = (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const user = queryOne('SELECT id, email, email_verified FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const verificationToken = crypto.randomBytes(16).toString('hex');
    run('UPDATE users SET verification_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [verificationToken, user.id]);

    res.json({
      success: true,
      verificationToken,
      message: 'A fresh verification token has been generated and sent.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. FORGOT PASSWORD (Generate short-lived reset token)
exports.forgotPassword = (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const user = queryOne('SELECT id, email, full_name FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (!user) {
      // Don't leak user existence in high-security, but return pleasant message
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been generated.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiration

    run(
      'UPDATE users SET reset_token = ?, reset_token_expires = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [resetToken, expiresAt, user.id]
    );

    res.json({
      success: true,
      resetToken, // Provided so the UI demo can directly test clicking the link
      resetLink: `/reset-password?token=${resetToken}`,
      message: 'Password reset link sent! Check your inbox or click the link below to reset.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. RESET PASSWORD (Verify token, hash new password, invalidate token)
exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const user = queryOne('SELECT id, email, reset_token_expires FROM users WHERE reset_token = ?', [token]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or previously used reset token' });
    }

    // Check expiration
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    run(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashed, user.id]
    );

    res.json({
      success: true,
      message: 'Password successfully updated! You can now log in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. SOCIAL / OAUTH LOGIN (Google, Apple, GitHub)
exports.socialLogin = async (req, res) => {
  try {
    const { provider, provider_id, email, full_name, avatar_url } = req.body;

    if (!provider || !email) {
      return res.status(400).json({ error: 'Provider and email are required for social login' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = queryOne(
      'SELECT * FROM users WHERE LOWER(email) = ? OR (provider = ? AND provider_id = ?)',
      [cleanEmail, provider, provider_id || '']
    );

    if (user) {
      // Account linking / update provider details if needed
      if (!user.provider || user.provider === 'local') {
        run(
          'UPDATE users SET provider = ?, provider_id = ?, avatar_url = COALESCE(avatar_url, ?), email_verified = 1 WHERE id = ?',
          [provider, provider_id || provider, avatar_url || null, user.id]
        );
      }
      user = queryOne('SELECT * FROM users WHERE id = ?', [user.id]);
    } else {
      // Create new user authenticated via provider
      const dummyPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      const generatedUsername = (full_name || email.split('@')[0]).replace(/\s+/g, '').toLowerCase() + '_' + Math.floor(Math.random() * 1000);

      run(
        `INSERT INTO users (email, password, full_name, username, avatar_url, role, email_verified, provider, provider_id)
         VALUES (?, ?, ?, ?, ?, 'customer', 1, ?, ?)`,
        [
          cleanEmail,
          dummyPassword,
          full_name || 'Traveler',
          generatedUsername,
          avatar_url || null,
          provider,
          provider_id || `${provider}_${Date.now()}`
        ]
      );

      user = queryOne('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    }

    const token = generateToken(user, '30d');
    const { password: _, ...safeUser } = user;

    res.json({
      user: safeUser,
      token,
      message: `Signed in via ${provider.charAt(0).toUpperCase() + provider.slice(1)}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. GUEST / DEMO LOGIN
exports.guestLogin = async (req, res) => {
  try {
    const guestNum = Math.floor(1000 + Math.random() * 9000);
    const guestEmail = `guest_${guestNum}@tims.guest`;
    const dummyPassword = await bcrypt.hash('guest123', 10);

    run(
      `INSERT INTO users (email, password, full_name, username, role, email_verified, provider)
       VALUES (?, ?, ?, ?, 'customer', 1, 'guest')`,
      [guestEmail, dummyPassword, `Guest Traveler #${guestNum}`, `guest_${guestNum}`]
    );

    const user = queryOne('SELECT * FROM users WHERE email = ?', [guestEmail]);
    const token = generateToken(user, '1d');
    const { password: _, ...safeUser } = user;

    res.json({
      user: safeUser,
      token,
      message: 'Logged in with Guest Access'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 9. PROFILE & USER MANAGEMENT
exports.getProfile = (req, res) => {
  const user = queryOne(
    'SELECT id, email, full_name, username, phone, avatar_url, role, is_active, email_verified, provider, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
};

exports.listUsers = (req, res) => {
  const users = queryAll(
    'SELECT id, email, full_name, username, phone, avatar_url, role, is_active, email_verified, provider, created_at FROM users ORDER BY created_at DESC'
  );
  res.json({ users });
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { is_active, role } = req.body;
  if (is_active !== undefined) {
    run('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [is_active ? 1 : 0, id]);
  }
  if (role) {
    run('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [role, id]);
  }
  const user = queryOne('SELECT id, email, full_name, username, phone, role, is_active, email_verified FROM users WHERE id = ?', [id]);
  res.json({ user });
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, username, phone, avatar_url, current_password, new_password } = req.body;

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to change your password' });
      }
      if (new_password.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }
      const user = queryOne('SELECT password FROM users WHERE id = ?', [userId]);
      const valid = await bcrypt.compare(current_password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      const hashed = await bcrypt.hash(new_password, 10);
      run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashed, userId]);
    }

    if (full_name) {
      run('UPDATE users SET full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [full_name.trim(), userId]);
    }
    if (username) {
      const existing = queryOne('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?', [username.trim(), userId]);
      if (existing) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
      run('UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [username.trim(), userId]);
    }
    if (phone !== undefined) {
      run('UPDATE users SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [phone || null, userId]);
    }
    if (avatar_url !== undefined) {
      run('UPDATE users SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [avatar_url || null, userId]);
    }

    const updatedUser = queryOne(
      'SELECT id, email, full_name, username, phone, avatar_url, role, is_active, email_verified, provider, created_at FROM users WHERE id = ?',
      [userId]
    );
    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
