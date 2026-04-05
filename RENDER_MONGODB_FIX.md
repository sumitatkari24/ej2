# Render Deployment Troubleshooting Guide

## ✅ Issue: Data Not Saving to MongoDB on Render

When you login and book trips on Render but data doesn't appear in MongoDB, it's usually one of these issues:

---

## 🔍 Quick Diagnostics

### 1. Check If MongoDB is Actually Connected on Render

Visit: `https://your-render-url.onrender.com/api/health`

You should see:
```json
{
  "status": "OK",
  "mongodb": "Connected ✅",
  "mongoUri": "Set",
  "timestamp": "2026-04-06T...",
  "help": null
}
```

If you see `"mongodb": "Connection Failed ❌"`, then the issue is MongoDB connection.

---

## 🔧 Fix Steps

### STEP 1: Fix Your Procfile (CRITICAL!)
Your current Procfile tries to change directories, which is wrong.

**Current (WRONG):**
```
web: cd trip-management-system && npm install && npm start
```

**Fixed (CORRECT):**
```
web: npm install && npm start
```

✅ Already fixed this for you!

---

### STEP 2: Set Environment Variables on Render

Log in to Render.com and go to your web service dashboard:

1. Click **Environment** in the left sidebar
2. Add these **environment variables**:

| Variable Name | Value |
|--------------|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | `EventuaSecret@2026` (or your secure key) |
| `PORT` | `3000` (or leave blank for auto) |

**Where to get MONGO_URI:**
- Go to [MongoDB Atlas](https://cloud.mongodb.com)
- Open your cluster → **Connect** button
- Select **Connect your application**
- Copy the connection string
- Replace `<password>` with your actual password
- Replace `<username>` with your actual username

---

### STEP 3: Update MongoDB Atlas IP Whitelist

MongoDB needs to allow Render's IP addresses. 

**Option A (Recommended for Production):**
1. Go to MongoDB Atlas → Your Cluster → **Network Access**
2. Click **Add IP Address**
3. Select **Allow access from anywhere** (0.0.0.0/0)
4. ✅ This allows Render to connect

**Option B (More Secure):**
1. Get Render's IP ranges: https://render.com/docs/static-outbound-ip-addresses
2. Whitelist only those IPs in MongoDB Atlas

---

### STEP 4: Redeploy on Render

1. Go to your Render service
2. Click **Manual Deploy** → **Deploy latest commit**
3. Watch the logs to make sure deployment succeeds
4. Check `/api/health` to verify MongoDB connection

---

## 📋 Deployment Checklist

- [ ] Procfile is fixed (root level, no subdirectory)
- [ ] MONGO_URI set in Render environment variables
- [ ] JWT_SECRET set in Render environment variables
- [ ] MongoDB Atlas IP whitelist includes Render
- [ ] Redeployed after setting environment variables
- [ ] Tested `/api/health` endpoint
- [ ] Logged in and created a test booking
- [ ] Checked MongoDB Atlas to see if booking was saved

---

## 🧪 Testing After Deployment

### Test 1: Check API Connection
```
GET https://your-render-url.onrender.com/api/health
```

Should return: `"mongodb": "Connected ✅"`

### Test 2: Test Registration
```
POST https://your-render-url.onrender.com/api/auth/register
Body: {
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@123"
}
```

Should return a JWT token.

### Test 3: Verify in MongoDB
1. Go to MongoDB Atlas
2. Open your cluster → **Browse Collections**
3. Check the `users` collection → should see your test user

### Test 4: Create a Booking
1. Login to your deployed site
2. Book a trip
3. Check MongoDB → `bookings` collection
4. Your booking should appear there with all details (including extra charges!)

---

## 🆘 Common Issues & Fixes

### Issue: "MONGO_URI not set"
**Solution:** Environment variables weren't saved properly
- Go to Render → Environment → verify MONGO_URI is there
- Redeploy with manual deploy button
- Wait 2-3 minutes for redeploy to complete

### Issue: MongoDB connection times out
**Solution:** IP whitelist or network issue
- Check MongoDB Atlas → Network Access
- Add 0.0.0.0/0 to allow all IPs (temporary for testing)
- Verify connection string format (should have `:27017`)

### Issue: 502 Bad Gateway on login
**Solution:** Server crashed or not running
- Check Render logs: Dashboard → Logs
- Look for error messages
- Fix the error and redeploy

### Issue: Login works but no data in MongoDB
**Solution:** Frontend might be pointing to wrong API
- Check browser console (F12 → Console tab)
- Look for failed fetch requests
- Verify API_BASE in frontend/js/app.js is `/api`
- Verify all JS files have `const API_BASE = '/api'` (not localhost!)

---

## 📝 Required Files in Root Directory

Render expects this structure:
```
tms2/
├── Procfile ✅ (must be at root)
├── package.json ✅ (root level)
├── backend/
│   ├── server.js
│   ├── .env (needs MONGO_URI set on Render)
│   ├── config/
│   ├── routes/
│   ├── models/
│   └── ...
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── booking.html
│   ├── js/
│   │   ├── app.js (API_BASE = '/api')
│   │   ├── auth.js
│   │   └── ...
│   └── ...
└── ...
```

---

## 🚀 After Deployment Works

Once everything is connected:
1. ✅ Users can register and login
2. ✅ Bookings are saved to MongoDB
3. ✅ Extra charges are calculated and stored
4. ✅ Payment information is stored
5. ✅ Dashboard shows all user bookings with full details

---

## 📞 Support

If still having issues:
1. Check Render deployment logs
2. Check MongoDB Atlas connection logs
3. Verify all environment variables are set
4. Try local testing first: `npm start` from root directory
5. Then deploy the fixed version to Render
