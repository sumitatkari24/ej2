# Eventua Journeys - Cloud Deployment Guide

## Option 1: Deploy to AWS Amplify (Recommended)

### Prerequisites
- AWS Account (free tier available)
- GitHub account
- MongoDB Atlas account (free tier)

### Step 1: Setup MongoDB Atlas (Cloud Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a cluster (free tier)
4. Create a user and get connection string
5. Whitelist your IP (or 0.0.0.0 for anywhere)
6. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/tripmanagement`

### Step 2: Prepare GitHub Repository
1. Initialize git in your project:
```bash
cd C:\Users\Admin\Desktop\tms2\trip-management-system
git init
git add .
git commit -m "Initial commit: Eventua Journeys"
```

2. Create GitHub repo and push:
```bash
git remote add origin https://github.com/YOUR-USERNAME/eventua-journeys.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy with AWS Amplify
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "Create App" → "Deploy an app"
3. Connect your GitHub repository
4. Select main branch
5. Accept build settings
6. Add environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a secure key
   - `NODE_ENV`: `production`
7. Deploy!

✅ Your site will be live at: `https://your-app-name.amplifyapp.com`

---

## Option 2: Deploy to Render (Easier Alternative)

1. Go to [Render.com](https://render.com)
2. Sign up (free)
3. Create new Web Service → Connect GitHub
4. Select your repository
5. Set build command: `npm start`
6. Add environment variables (MONGO_URI, JWT_SECRET)
7. Deploy!

---

## Option 3: Deploy Locally on Network (LAN)

To let others on your WiFi access the site:

1. Start MongoDB:
```powershell
mongod --dbpath C:\data\db
```

2. Start backend:
```powershell
cd C:\Users\Admin\Desktop\tms2\trip-management-system
npm start
```

3. Find your computer's IP:
```powershell
ipconfig
```
Look for IPv4 Address (e.g., 192.168.1.100)

4. Share the link: `http://192.168.1.100:5000`

Others on your WiFi can now visit!

---

## Environment Variables (.env)

Update `backend/.env` with:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tripmanagement
JWT_SECRET=YourSecretKey123
PORT=5000
```

---

## Testing After Deployment
1. Visit your deployed URL
2. Register a new account
3. Login
4. Explore trips
5. Book a trip
6. Check dashboard

---

## Troubleshooting

**"Cannot find module"**
- Run: `npm install` in project root

**MongoDB connection error**
- Check MONGO_URI is correct
- Whitelist your IP in MongoDB Atlas

**Port already in use**
- Change PORT in .env file

**Frontend not loading**
- Ensure backend is serving static files correctly
- Check backend/server.js has the frontend serving code

