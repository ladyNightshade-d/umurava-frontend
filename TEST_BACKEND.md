# Testing Backend Connection

## Quick Test in Browser Console

1. Open your site: https://hirewiseai.netlify.app/forgot-password
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this code and press Enter:

```javascript
fetch('https://umurava-backen.onrender.com/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com' })
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

## What to Look For:

### If you see "✅ Success":
- Backend is working!
- Issue is in frontend code
- Check Network tab for actual request

### If you see "❌ Error: CORS":
- Backend CORS not configured for Netlify
- Need to update backend cors settings

### If you see "❌ Error: Failed to fetch":
- Backend is sleeping/down
- Wait 60 seconds and try again
- Or backend URL is wrong

### If you see "❌ Error: 404":
- Endpoint doesn't exist
- Route not configured properly

---

## Also Check Network Tab:

1. Open **Network** tab in DevTools
2. Click "Send OTP" button
3. Look for the request to `/auth/forgot-password`
4. Click on it
5. Check:
   - **Status**: Should be 200
   - **Response**: What does it say?
   - **Headers**: Is CORS allowed?

Take a screenshot and share what you see!
