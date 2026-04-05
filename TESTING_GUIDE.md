# 🧪 TMS BOOKING SYSTEM - MANUAL TEST GUIDE

## Quick Test (No Installation Required!)

### Step 1: Start Frontend Server
```bash
cd c:\Users\Admin\Desktop\tms2
cd trip-management-system
python -m http.server 8000
```
Then open: **http://localhost:8000/frontend**

---

## 📋 BOOKING STEP-BY-STEP TEST

### Test Case 1: Verify Cash-Only Payment Option ✅

**Steps:**
1. Go to http://localhost:8000/frontend/booking.html
2. Scroll to **Step 3: Payment Form** section
3. Look for payment method section

**Expected Result:**
```
✅ Should see:
  - Single radio button labeled "💵 Cash Payment"
  - Help text: "Please pay in cash at the pickup location"
  - NO card fields
  - NO UPI fields
  - NO PayPal fields
```

**Verification:**
- [ ] Only one payment method visible
- [ ] Payment method is labeled "Cash Payment"
- [ ] Radio button is pre-selected (checked)

---

### Test Case 2: Verify Two Date Fields ✅

**Steps:**
1. Go to http://localhost:8000/frontend/booking.html
2. Look at **Step 2: Date Selection** section

**Expected Result:**
```
✅ Should see TWO date input fields:
  Field 1: "Pickup Date" 
    └─ Help text: "Select the date for pickup"
  
  Field 2: "Travel Date (To)"
    └─ Help text: "Select the date you want to end your journey"
```

**Verification:**
- [ ] Two separate date input fields visible
- [ ] First field labeled "Pickup Date"
- [ ] Second field labeled "Travel Date (To)"
- [ ] Both fields have calendar pickers
- [ ] Help text explains what each date is for

---

### Test Case 3: Verify Pickup Address Field ✅

**Steps:**
1. Go to http://localhost:8000/frontend/booking.html
2. Look at **Step 2.5: Pickup Location** section

**Expected Result:**
```
✅ Should see:
  - Text input for "Pickup Location"
  - Placeholder: "Enter your pickup address"
  - Help text with 📍 icon
  - Number of Travelers dropdown (1-5)
  - Special Requests textarea (optional)
```

**Verification:**
- [ ] Pickup address text input visible
- [ ] Address placeholder text correct
- [ ] Travelers dropdown shows options 1-5
- [ ] Special Requests field present

---

### Test Case 4: Complete Booking Flow (Manual Data Entry)

**Step 1: Select Trip**
1. Open booking.html
2. Click on "Select a Trip" dropdown
3. Choose any trip
4. Click "Select Travel Date"

**Step 2: Select Dates**
1. Click "Pickup Date" field
2. Select today's date + 1 day
3. Click "Travel Date (To)" field
4. Select today's date + 7 days
5. Click "Continue"

**Step 3: Enter Pickup Details**
1. Enter address: "123 Main Street, Sample City"
2. Select "2 People" from travelers dropdown
3. (Optional) Add special requests
4. Click "Proceed to Payment"

**Step 4: Review & Pay (Cash)**
1. Check booking summary displays:
   - [ ] Trip name and destination
   - [ ] Pickup date (formatted)
   - [ ] Travel date (formatted)
   - [ ] Pickup address
   - [ ] Number of travelers
   - [ ] Total amount
2. Verify cash payment option:
   - [ ] "💵 Cash Payment" radio is selected
   - [ ] Help text explains cash at pickup
3. Click "Complete Booking"

**Expected Result:**
```
✅ Should see:
  Message: "✅ Booking confirmed! Please pay in cash at the pickup location. Redirecting to dashboard..."
  
Then redirect to dashboard.html after 2 seconds
```

---

## 📊 Backend Response Verification

### What Gets Sent to Backend

**Booking Creation Request:**
```json
{
  "tripId": "sample-trip-1",
  "pickupDate": "2026-04-05",
  "travelDate": "2026-04-11",
  "pickupAddress": "123 Main Street, Sample City",
  "numTravelers": 2,
  "totalPrice": 500,
  "paymentMethod": "cash"
}
```

**Check in Browser DevTools (F12):**
1. Open browser Developer Tools (F12)
2. Go to **Network** tab
3. Create a booking (follow Test Case 4)
4. Look for POST request to `http://localhost:5000/api/bookings`
5. Click on it and go to **Request** tab
6. Verify the request body includes:
   - [ ] `"tripId"` field
   - [ ] `"pickupDate"` field  
   - [ ] `"travelDate"` field
   - [ ] `"pickupAddress"` field
   - [ ] `"numTravelers"` field
   - [ ] `"paymentMethod": "cash"` ← **CRITICAL**

**Expected Response:**
```json
{
  "_id": "booking-123...",
  "tripId": "sample-trip-1",
  "pickupDate": "2026-04-05T00:00:00.000Z",
  "travelDate": "2026-04-11T00:00:00.000Z",
  "pickupAddress": "123 Main Street, Sample City",
  "numTravelers": 2,
  "paymentMethod": "cash",
  "status": "confirmed",
  "paid": true
}
```

---

## 🎯 CRITICAL VERIFICATION POINTS

### 1️⃣ Payment Method Must Be ONLY "cash"
```javascript
// In browser console, verify:
const paymentRadio = document.querySelector('input[name="paymentMethod"]');
console.log(paymentRadio.value);  // Should print: "cash"

// Check if multiple options exist:
const allMethods = document.querySelectorAll('input[name="paymentMethod"]');
console.log(allMethods.length);  // Should be: 1 (only cash)
```

### 2️⃣ Both Dates Are Captured
```javascript
// When clicking "Continue" from date step:
const pickupDate = document.getElementById('pickupDate').value;
const travelDate = document.getElementById('travelDate').value;
console.log('Pickup:', pickupDate, 'Travel:', travelDate);
// Should both have values like "2026-04-05" format
```

### 3️⃣ Payment Request Includes paymentMethod: 'cash'
```javascript
// When clicking "Complete Booking", check Network tab:
// POST /api/payments/process-payment should have:
{
  "bookingId": "...",
  "amount": 500,
  "paymentMethod": "cash"  // ← MUST BE PRESENT
}
```

### 4️⃣ Dashboard Shows Booking
After booking created:
1. Navigate to http://localhost:8000/frontend/dashboard.html
2. Verify:
   - [ ] Booking appears in list
   - [ ] Shows trip name
   - [ ] Shows travel date
   - [ ] Shows payment status (Paid ✅)
   - [ ] Shows booking status (confirmed)

---

## 🐛 TROUBLESHOOTING

### Issue: Booking button disabled
**Check:** 
- Is payment method selected?
- Are all required fields filled?
- Is there a validation error message?

### Issue: Dates not showing correctly
**Check DevTools Console (F12 → Console):**
```javascript
// Test the current state
console.log(document.getElementById('pickupDate').value);
console.log(document.getElementById('travelDate').value);
// Both should show date in YYYY-MM-DD format
```

### Issue: Payment not being processed
**Check Network tab (F12 → Network):**
1. Click "Complete Booking"
2. Look for requests to `/api/payments/process-payment`
3. Check response for errors
4. Check if `paymentMethod: 'cash'` was sent

### Issue: Booking doesn't appear in dashboard
**Possible causes:**
1. Backend server not running
2. Auth token missing (offline mode uses fallback)
3. Check browser console for errors
4. Try hard refresh (Ctrl+Shift+R)

---

## 📱 RESPONSIVE TEST

Test on different screen sizes:
- [ ] Mobile (320px width) - Elements responsive?
- [ ] Tablet (768px width) - Layout good?
- [ ] Desktop (1200px width) - Full layout works?

Use Chrome DevTools: **Ctrl+Shift+M** to toggle device mode

---

## ✅ FINAL CHECKLIST

Before declaring system ready:

- [ ] Cash payment is only option
- [ ] Both pickup and travel dates fields exist
- [ ] Pickup address field exists
- [ ] Booking creation succeeds
- [ ] Payment method "cash" sent in request
- [ ] Booking appears in dashboard
- [ ] All dates preserved in dashboard display
- [ ] Responsive on mobile/tablet/desktop
- [ ] Console has no error messages
- [ ] Network requests show proper data

---

## 📞 SUPPORT

If any test fails:
1. Check browser console (F12 → Console) for errors
2. Check Network tab for API responses
3. Check that backend server is running on port 5000
4. Verify all three code versions are synchronized
5. Refer to BOOKING_STATUS_REPORT.md for configuration details
