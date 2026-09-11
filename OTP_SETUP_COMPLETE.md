# 🎉 OTP Password Reset - Setup Complete!

## ✅ Implementation Summary

### Frontend (HireWise_Core) ✅
- **Forgot Password Page**: `/app/forgot-password/page.tsx`
  - Email input with validation
  - OTP request button
  - Auto-redirect to reset page
  
- **Reset Password Page**: `/app/reset-password/page.tsx`
  - 6-digit OTP input (numeric only)
  - 10-minute countdown timer
  - Resend OTP functionality
  - New password fields with validation
  - Real-time password match checking
  - Expiration handling

### Backend (umurava-backend) ✅
- **Auth Controller**: `src/controllers/authController.ts`
  - `forgotPassword()` - Generates & sends OTP
  - `resetPassword()` - Verifies OTP & updates password
  
- **Email Service**: `src/services/emailService.ts`
  - `sendOTPEmail()` - Sends beautiful branded OTP email
  
- **User Model**: `src/models/User.ts`
  - `otpCode` field (hashed)
  - `otpExpires` field (10 min expiry)
  
- **Routes**: `src/routes/authRoutes.ts`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`

---

## 🔧 Configuration Needed

### Backend .env Setup

Your backend `.env` file needs a **RESEND_API_KEY** for sending emails:

```env
# Add this to your .env file:
RESEND_API_KEY=re_your_api_key_here

# Your existing vars (already set):
MONGO_URI=mongodb://...
JWT_SECRET=umurava_secret_key_2026
GEMINI_API_KEY=AIzaSy...
```

### How to Get Resend API Key:

1. **Go to**: https://resend.com
2. **Sign up** for a free account
3. **Go to**: API Keys section
4. **Create** a new API key
5. **Copy** the key and add it to your `.env` file

**Free Tier Limits**:
- 100 emails/day
- 3,000 emails/month
- Perfect for development and testing!

### Alternative: Development Mode

If you don't add the RESEND_API_KEY, the system will run in **DEV MODE**:
- OTPs will be logged to the console instead of emailed
- You can copy the OTP from server logs for testing
- Check your terminal running the backend to see: `[DEV] OTP email to user@example.com: 123456`

---

## 🚀 How to Test

### 1. Start Backend Server
```bash
cd c:\Users\HP\umurava-backend
npm run dev
```

### 2. Start Frontend Server
```bash
cd c:\Users\HP\HireWise_Core
npm run dev
```

### 3. Test Flow

**Step 1: Request OTP**
- Navigate to: http://localhost:3000/forgot-password
- Enter your registered email
- Click "Send OTP"
- ✅ Success message appears
- ✅ Auto-redirects to reset page
- ✅ Check email for OTP (or server logs if in DEV mode)

**Step 2: Reset Password**
- Enter the 6-digit OTP
- ✅ Timer shows 10:00 countdown
- Enter new password (min 8 chars)
- Confirm new password
- Click "Reset password"
- ✅ Success message appears
- ✅ Redirected to sign in

**Step 3: Sign In**
- Use your email and NEW password
- ✅ Should successfully log in

---

## 🔍 API Endpoints

### POST /api/auth/forgot-password
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If that email is registered, you will receive a code shortly.",
  "expiresIn": "10 minutes"
}
```

### POST /api/auth/reset-password
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful. You can now log in."
}
```

---

## 🔒 Security Features

✅ **OTP Hashing**: OTPs are hashed with SHA-256 before storage
✅ **10-Minute Expiration**: OTPs automatically expire
✅ **Single Use**: OTPs are deleted after successful use
✅ **No Email Enumeration**: Same response whether email exists or not
✅ **Rate Limiting**: Built-in rate limiting on auth endpoints
✅ **Password Strength**: Minimum 8 characters enforced
✅ **Secure Email**: Professional HTML email template

---

## 📧 Email Preview

When users request password reset, they receive:

**Subject**: Your Password Reset OTP - HireWise AI

**Content**:
- Branded HireWise header (burgundy/maroon)
- Large, easy-to-read 6-digit OTP code
- Security warnings:
  - 10-minute expiration
  - Never share with anyone
  - Ignore if not requested
- Professional footer

**Example OTP Format**: `1 2 3 4 5 6` (spaced for readability)

---

## 🐛 Troubleshooting

### Issue: Emails not sending
**Solution**: 
- Check if `RESEND_API_KEY` is set in backend `.env`
- In DEV mode, check server console for OTP
- Verify Resend account is active

### Issue: OTP expired
**Solution**: 
- User can click "Resend OTP" button
- New OTP generated with fresh 10-minute window

### Issue: Invalid OTP error
**Solution**: 
- Check OTP was entered correctly
- Verify OTP hasn't expired
- Try requesting a new OTP

### Issue: Frontend can't connect to backend
**Solution**: 
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Default should be: `http://localhost:5000/api`
- Ensure backend server is running

---

## 📝 User Flow Diagram

```
User clicks "Forgot Password"
         ↓
Enter email address
         ↓
Backend generates 6-digit OTP
         ↓
OTP saved to DB (hashed, expires in 10 min)
         ↓
Email sent with OTP
         ↓
User redirected to Reset Password page
         ↓
User enters: Email + OTP + New Password
         ↓
Backend verifies OTP is valid & not expired
         ↓
Password updated (hashed with bcrypt)
         ↓
OTP deleted from DB
         ↓
Success! User can now log in
```

---

## 📂 Files Modified/Created

### Frontend
- ✅ `/app/forgot-password/page.tsx` (updated)
- ✅ `/src/views/ForgotPassword.tsx` (updated)
- ✅ `/app/reset-password/page.tsx` (updated)
- ✅ `/src/views/ResetPassword.tsx` (updated)
- ✅ `/BACKEND_API_SPEC.md` (updated)
- ✅ `/FORGOT_PASSWORD_OTP_IMPLEMENTATION.md` (created)
- ✅ `/OTP_SETUP_COMPLETE.md` (this file)

### Backend
- ✅ `/src/controllers/authController.ts` (already had OTP logic)
- ✅ `/src/services/emailService.ts` (updated - added sendOTPEmail)
- ✅ `/src/models/User.ts` (already had otpCode & otpExpires fields)
- ✅ `/src/routes/authRoutes.ts` (already configured)

---

## 🎯 Next Steps

1. **Add RESEND_API_KEY to backend .env**
2. **Test the complete flow**
3. **Deploy to production** (optional)
4. **Configure production email domain** in Resend (optional)

---

## 📞 Support

If you encounter any issues:
1. Check this document first
2. Review `/FORGOT_PASSWORD_OTP_IMPLEMENTATION.md` for detailed implementation
3. Check `/BACKEND_API_SPEC.md` for API documentation
4. Verify all environment variables are set correctly

---

**Status**: ✅ **COMPLETE & READY FOR TESTING**

**Last Updated**: September 11, 2026  
**Created By**: Kiro AI Assistant
