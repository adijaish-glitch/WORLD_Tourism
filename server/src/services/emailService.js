const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this._initTransporter();
  }

  _initTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  /**
   * Send Verification Email
   */
  async sendVerificationEmail(email, token, fullName = 'Traveler') {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyLink = `${clientUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    const from = process.env.SMTP_FROM || '"TIMS Tourism" <support@tims-tourism.com>';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 8px;">
        <h2 style="color: #09090b; margin-bottom: 8px;">❖ Confirm Your TIMS Boarding Access</h2>
        <p style="color: #52525b; font-size: 16px;">Hello ${fullName},</p>
        <p style="color: #52525b; line-height: 1.5;">
          Thank you for registering with TIMS (Tourism Information Management System). Please confirm your email address to activate your account.
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${verifyLink}" style="background-color: #09090b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify Email Address →
          </a>
        </div>
        <p style="color: #71717a; font-size: 13px;">Or copy and paste this link into your browser:</p>
        <p style="background: #f4f4f5; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all; color: #27272a;">${verifyLink}</p>
        <p style="color: #a1a1aa; font-size: 12px; margin-top: 24px;">Verification Code: <strong>${token}</strong></p>
      </div>
    `;

    let sent = false;
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: email,
          subject: 'Confirm your TIMS Account',
          html
        });
        sent = true;
        console.log(`✉️ Verification email sent to ${email}`);
      } catch (err) {
        console.warn(`SMTP send error to ${email}:`, err.message);
      }
    }

    if (!sent) {
      console.log('==================================================');
      console.log(`✉️ [EMAIL SERVICE DEV SIMULATOR]`);
      console.log(`To:          ${email}`);
      console.log(`Subject:     Confirm your TIMS Account`);
      console.log(`Verify Link: ${verifyLink}`);
      console.log(`Token:       ${token}`);
      console.log('==================================================');
    }

    return { sent, verifyLink, token };
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordResetEmail(email, resetToken, fullName = 'Traveler') {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;
    const from = process.env.SMTP_FROM || '"TIMS Tourism" <support@tims-tourism.com>';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 8px;">
        <h2 style="color: #09090b; margin-bottom: 8px;">❖ Reset Your TIMS Password</h2>
        <p style="color: #52525b; font-size: 16px;">Hello ${fullName},</p>
        <p style="color: #52525b; line-height: 1.5;">
          A password reset request was initiated for your account. This single-use link is valid for 1 hour.
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${resetLink}" style="background-color: #09090b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password Now →
          </a>
        </div>
        <p style="color: #71717a; font-size: 13px;">Or copy and paste this link into your browser:</p>
        <p style="background: #f4f4f5; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all; color: #27272a;">${resetLink}</p>
        <p style="color: #ef4444; font-size: 12px; margin-top: 24px;">If you did not request this reset, you can safely ignore this message.</p>
      </div>
    `;

    let sent = false;
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: email,
          subject: 'Reset your TIMS Password',
          html
        });
        sent = true;
        console.log(`✉️ Password reset email sent to ${email}`);
      } catch (err) {
        console.warn(`SMTP reset send error to ${email}:`, err.message);
      }
    }

    if (!sent) {
      console.log('==================================================');
      console.log(`✉️ [EMAIL SERVICE DEV SIMULATOR]`);
      console.log(`To:         ${email}`);
      console.log(`Subject:    Reset your TIMS Password`);
      console.log(`Reset Link: ${resetLink}`);
      console.log(`Token:      ${resetToken}`);
      console.log('==================================================');
    }

    return { sent, resetLink, resetToken };
  }
}

module.exports = new EmailService();
