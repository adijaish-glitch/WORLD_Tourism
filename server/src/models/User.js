const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  token_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
  user_agent: { type: String, default: '' },
  ip: { type: String, default: '' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true,
    index: true
  },
  password: {
    type: String,
    required: function () {
      return this.provider === 'local';
    }
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  phone_verified: {
    type: Boolean,
    default: false
  },
  avatar_url: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  verification_token: {
    type: String,
    default: null
  },
  verification_token_expires: {
    type: Date,
    default: null
  },
  reset_token: {
    type: String,
    default: null
  },
  reset_token_expires: {
    type: Date,
    default: null
  },
  phone_otp_hash: {
    type: String,
    default: null
  },
  phone_otp_expires: {
    type: Date,
    default: null
  },
  phone_otp_attempts: {
    type: Number,
    default: 0
  },
  firebase_uid: {
    type: String,
    sparse: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['local', 'phone', 'google', 'apple', 'guest', 'firebase', 'github'],
    default: 'local'
  },
  provider_id: {
    type: String,
    default: null
  },
  sessions: [sessionSchema]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Helper to return user object safe for client consumption
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.phone_otp_hash;
  delete obj.verification_token;
  delete obj.reset_token;
  delete obj.sessions;
  
  // Format consistent ID
  obj.id = obj.sqlite_id || obj._id.toString();
  return obj;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
