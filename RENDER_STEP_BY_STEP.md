# Step-by-Step Render Deployment Video Guide

## Prerequisites Before Deploying to Render

✅ GitHub repository pushed to main branch
✅ MongoDB Atlas cluster created
✅ Render.com account created and linked to GitHub

---

## The 3-Minute Fix

### What's Wrong?
Your Procfile and environment variables aren't set correctly on Render, so MongoDB connection fails silently.

### What We Fixed?
1. **Procfile** - Changed from `cd trip-management-system && ...` to root-level execution
2. **Added proper error diagnostics** - `/api/health` endpoint shows connection status

### What You Need to Do?

---

## ⚙️ Render Configuration (MUST DO THIS!)

### Step 1: Go to Your Render Web Service
1. Login to [render.com](https://render.com)
2. Click your **trip-management-system** service
3. Go to **Settings** tab

### Step 2: Update Build & Start Commands
Click **Settings** and update:

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

*(Previously it had `cd trip-management-system` which caused the issue)*

### Step 3: Add Environment Variables
1. Click **Environment** tab in the left sidebar
2. Click **Add Environment Variable**
3. Add these three variables:

**Variable 1:**
- Key: `MONGO_URI`
- Value: `mongodb+srv://atkarisumit3_db_user:Pcg288oqy@ac-1f1skdq-shard-00-00.tqxhs2j.mongodb.net:27017,ac-1f1skdq-shard-00-01.tqxhs2j.mongodb.net:27017,ac-1f1skdq-shard-00-02.tqxhs2j.mongodb.net:27017/tripmanagement?ssl=true&authSource=admin`

**Variable 2:**
- Key: `JWT_SECRET`
- Value: `EventuaSecret@2026`

**Variable 3:**
- Key: `NODE_ENV`
- Value: `production`

### Step 4: Update MongoDB Atlas Whitelist
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click your cluster name
3. Go to **Network Access** in left menu
4. Click **Add IP Address**
5. Click **Allow access from anywhere** (0.0.0.0/0)
6. Click **Confirm**

> This allows Render servers to access your MongoDB. In production, you'd use specific IP ranges instead.

### Step 5: Trigger Redeploy
1. Back on Render dashboard
2. Click **Manual Deploy** button
3. Select **Deploy latest commit**
4. Wait 3-5 minutes for deployment
5. Check the logs - you should see:
   ```
   ✅ MongoDB Connected: ac-1f1skdq-shard-00-00.tqxhs2j.mongodb.net
   ```

---

## ✅ Verify It Works

### Test 1: Check Health Status
Open in browser:
```
https://YOUR_RENDER_URL.onrender.com/api/health
```

**Expected response:**
```json
{
  "status": "OK",
  "mongodb": "Connected ✅",
  "mongoUri": "Set",
  "timestamp": "2026-04-06T21:55:47.498Z",
  "help": null
}
```

If you see `"Connection Failed ❌"`, check:
- [ ] MONGO_URI variable is set correctly
- [ ] MongoDB whitelist includes Render IPs (0.0.0.0/0)
- [ ] Redeploy was completed

### Test 2: Test Registration
1. Go to deployed site: `https://YOUR_RENDER_URL.onrender.com`
2. Click **Register**
3. Create account:
   - Name: Test User
   - Email: test@your-domain.com
   - Password: Test@123
4. Click Register

**Expected:** Login automatically or see login page

### Test 3: Verify in MongoDB
1. Go to MongoDB Atlas
2. Click your cluster
3. Click **Collections**
4. Look for `users` collection
5. You should see your test user there

### Test 4: Book a Trip
1. Login with your test account
2. Click a trip
3. Fill in booking details (dates, address, travelers)
4. Go through payment
5. Complete booking

### Test 5: Verify Booking in MongoDB
1. MongoDB Atlas → Collections
2. Click `bookings` collection
3. Should see your booking with:
   - tripId
   - userId
   - pickupDate, travelDate
   - numTravelers
   - **basePrice, extraDaysCharge, extraPersonsCharge** (new!)
   - totalPrice
   - status: "confirmed"
   - paymentStatus: "pending" or "paid"

---

## 📊 What's Now Working

✅ **Authentication** - Users register/login → Data saved to `users` collection
✅ **Bookings** - Users book trips → Data saved to `bookings` collection  
✅ **Extra Charges** - Extra days & persons charges calculated and stored
✅ **Payments** - Payment info saved to `payments` collection
✅ **Dashboard** - Shows all user's bookings with full details

---

## 🐛 If It Still Doesn't Work

### Check 1: Render Logs
1. Go to Render dashboard
2. Click your service
3. Scroll down to **Logs**
4. Look for red error messages
5. Common errors:
   - `MONGO_URI not set` → Add env variable
   - `connection timeout` → Check MongoDB whitelist
   - `Cannot find module` → Run manual deploy again

### Check 2: MongoDB Logs
1. MongoDB Atlas → Cluster
2. Click **Activity Feed**
3. Look for connection attempts from Render
4. Check for authentication failures

### Check 3: Browser Console
1. Open deployed site in browser
2. Press **F12** → **Console** tab
3. Look for red error messages
4. Common errors:
   - `Failed to fetch /api/...` → MongoDB not connected
   - `JWT signature invalid` → Check JWT_SECRET
   - `CORS error` → Check backend CORS settings

---

## 🎯 Success Indicators

You'll know it's working when:

1. ✅ `/api/health` shows `"mongodb": "Connected ✅"`
2. ✅ Can register new user
3. ✅ New user appears in MongoDB `users` collection
4. ✅ Can login with new account
5. ✅ Can book a trip
6. ✅ Booking appears in MongoDB `bookings` collection with all details
7. ✅ Dashboard shows booked trips
8. ✅ Payment info saved in MongoDB

---

## 📱 Deployment Complete!

Your Trip Management System is now live on Render with MongoDB persistence!

**URLs:**
- Live Site: `https://YOUR_RENDER_URL.onrender.com/`
- Health Check: `https://YOUR_RENDER_URL.onrender.com/api/health`
- GitHub: [Your Repo]
- MongoDB: [Your Cluster]

All data is now persisting to MongoDB! 🎉
