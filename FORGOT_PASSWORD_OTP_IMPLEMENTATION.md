# Forgot Password OTP Implementation Guide

## Overview
This document provides a complete guide to implement the OTP-based password reset flow for HireWise.

## Flow Summary
1. User enters email on forgot password page
2. System generates 6-digit OTP and sends it via email
3. OTP expires after 10 minutes
4. User enters OTP and new password on reset page
5. System verifies OTP and updates password

---

## Frontend Implementation ✅

### Pages Updated:
- **Forgot Password**: `/app/forgot-password/page.tsx`
- **Reset Password**: `/app/reset-password/page.tsx`

### Features Implemented:
✅ Email input with validation
✅ OTP sent confirmation with auto-redirect
✅ 6-digit OTP input field (numeric only)
✅ 10-minute countdown timer display
✅ Resend OTP button (enabled after 1 minute)
✅ Password strength validation (min 8 characters)
✅ Real-time password match validation
✅ OTP expiration handling
✅ Success confirmation screen

---

## Backend Implementation Guide

### 1. Database Schema

You need to add an OTP table/collection to store temporary OTPs:

```sql
-- PostgreSQL Example
CREATE TABLE password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used BOOLEAN DEFAULT FALSE
);

-- Add index for faster lookups
CREATE INDEX idx_email_otp ON password_reset_otps(email, otp);
CREATE INDEX idx_expires_at ON password_reset_otps(expires_at);
```

```javascript
// MongoDB Example
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true, length: 6 },
  expiresAt: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour
});

otpSchema.index({ email: 1, otp: 1 });
```

---

### 2. API Endpoints

#### A. POST /auth/forgot-password

**Purpose**: Generate and send OTP to user's email

```typescript
// Example implementation (Express + Node.js)
import crypto from 'crypto';
import nodemailer from 'nodemailer';

router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({ 
        message: 'If the email exists, OTP has been sent',
        expiresIn: '10 minutes'
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Set expiration (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTPs for this email
    await PasswordResetOTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await PasswordResetOTP.create({
      email: email.toLowerCase(),
      otp,
      expiresAt,
      used: false
    });

    // Send email (configure your email service)
    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({ 
      message: 'OTP sent to your email',
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Unable to process request' });
  }
});
```

#### B. POST /auth/reset-password

**Purpose**: Verify OTP and reset password

```typescript
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Validate inputs
    if (!email || !otp || !password) {
      return res.status(400).json({ 
        message: 'Email, OTP, and password are required' 
      });
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters' 
      });
    }

    // Find valid OTP
    const otpRecord = await PasswordResetOTP.findOne({
      email: email.toLowerCase(),
      otp,
      used: false,
      expiresAt: { $gt: new Date() } // Not expired
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        message: 'Invalid or expired OTP' 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Mark OTP as used (or delete it)
    await PasswordResetOTP.deleteOne({ _id: otpRecord._id });

    // Optional: Send confirmation email
    await sendPasswordResetConfirmationEmail(email, user.name);

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Unable to reset password' });
  }
});
```

---

### 3. Email Service Implementation

#### Option A: Using Nodemailer (SMTP)

```typescript
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send OTP email
async function sendOTPEmail(email: string, otp: string, userName: string) {
  const mailOptions = {
    from: `"HireWise AI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Password Reset OTP - HireWise AI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B1538; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background: white; border: 2px solid #8B1538; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8B1538; margin: 20px 0; border-radius: 8px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧠 HireWise AI</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your password. Use the OTP below to proceed:</p>
            
            <div class="otp-box">${otp}</div>
            
            <div class="warning">
              ⚠️ <strong>Important:</strong>
              <ul style="margin: 10px 0;">
                <li>This OTP expires in <strong>10 minutes</strong></li>
                <li>Do not share this OTP with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>If the OTP expires, you can request a new one from the password reset page.</p>
            
            <p>Best regards,<br><strong>HireWise AI Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} HireWise AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send password reset confirmation
async function sendPasswordResetConfirmationEmail(email: string, userName: string) {
  const mailOptions = {
    from: `"HireWise AI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password Reset Successful - HireWise AI',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hello ${userName},</h2>
          <p>Your password has been successfully reset.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <p>Best regards,<br><strong>HireWise AI Team</strong></p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
```

#### Option B: Using SendGrid

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendOTPEmail(email: string, otp: string, userName: string) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Your Password Reset OTP - HireWise AI',
    html: `<!-- Same HTML template as above -->`,
  };

  await sgMail.send(msg);
}
```

---

### 4. Environment Variables

Add these to your backend `.env` file:

```env
# SMTP Configuration (for Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OR SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@hirewise.com
```

---

### 5. Security Best Practices

✅ **Rate Limiting**: Limit OTP requests per email (e.g., max 3 per hour)
✅ **OTP Complexity**: Use 6-digit numeric codes
✅ **Expiration**: 10-minute validity window
✅ **Single Use**: Delete OTP after successful reset
✅ **Email Validation**: Verify email format
✅ **Password Strength**: Enforce minimum 8 characters
✅ **HTTPS Only**: Ensure all API calls use HTTPS in production
✅ **No Email Enumeration**: Don't reveal if email exists
✅ **Audit Logging**: Log all password reset attempts

---

### 6. Testing Checklist

Backend Testing:
- [ ] OTP generates correctly (6 digits)
- [ ] Email sends successfully
- [ ] OTP expires after 10 minutes
- [ ] Expired OTP returns error
- [ ] Invalid OTP returns error
- [ ] OTP can only be used once
- [ ] Password is hashed before storage
- [ ] Old OTPs are cleaned up
- [ ] Rate limiting works
- [ ] Email validation works

Frontend Testing:
- [ ] Forgot password form submits
- [ ] Success message displays
- [ ] Auto-redirect to reset page
- [ ] OTP input accepts only 6 digits
- [ ] Countdown timer works correctly
- [ ] Resend OTP button works
- [ ] Password validation works
- [ ] Password match validation works
- [ ] Submit disabled when OTP expired
- [ ] Success screen displays correctly

---

## Quick Start

1. **Install dependencies**:
```bash
npm install nodemailer
# OR
npm install @sendgrid/mail
```

2. **Add database model** (see schema above)

3. **Implement API endpoints** (see examples above)

4. **Configure email service** (add env variables)

5. **Test the flow** end-to-end

---

## Support

For issues or questions about this implementation, check:
- Frontend: `/src/views/ForgotPassword.tsx` and `/src/views/ResetPassword.tsx`
- API Spec: `BACKEND_API_SPEC.md`
- This Guide: `FORGOT_PASSWORD_OTP_IMPLEMENTATION.md`

---

**Last Updated**: September 11, 2026  
**Status**: ✅ Frontend Complete | ⏳ Backend Pending Implementation
