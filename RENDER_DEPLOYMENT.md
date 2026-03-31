# Deployment Guide - Render.com

## Prerequisites
- GitHub account with the repository pushed
- Render.com account (free tier available)
- MongoDB Atlas account for the database (or local MongoDB)

## Steps to Deploy on Render.com

### 1. Create MongoDB Database
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free account or log in
- Create a new cluster
- Get your connection string (MONGO_URI)

### 2. Deploy on Render.com
- Go to [Render.com](https://render.com)
- Connect your GitHub account
- Click "New" → "Web Service"
- Select the `ejms` repository
- Configure the following:
  - **Name**: trip-management-system
  - **Environment**: Node
  - **Build Command**: `cd trip-management-system && npm install`
  - **Start Command**: `cd trip-management-system && npm start`
  - **Plan**: Free (or Starter if needed)

### 3. Set Environment Variables
In Render's dashboard, add the following environment variables:
- `NODE_ENV`: `production`
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key (generate a random string)

### 4. Deploy
- Click "Create Web Service"
- Render will automatically deploy your application
- Monitor the deploy logs to ensure everything runs correctly

## Troubleshooting

### Issue: "Could not locate Gemfile"
This means Render is incorrectly detecting your project as Ruby. Ensure:
- The `Procfile` is in the root directory
- The `package.json` is in the root of the trip-management-system folder
- Your repository has the correct structure

### Issue: MongoDB Connection Error
- Verify your MONGO_URI environment variable is set correctly
- Ensure your MongoDB Atlas IP whitelist includes Render's IP address
- Check MongoDB connection string format

### Issue: Port Not Available
Render sets the PORT environment variable automatically. Ensure your server.js listens on `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## Environment Variables Needed
- `MONGO_URI`: MongoDB connection string
- `NODE_ENV`: Set to `production` for deployment
- `JWT_SECRET`: Secret key for JWT authentication (optional but recommended)

## Local Development
To run locally:
```bash
cd trip-management-system
npm install
npm run dev
```

## Production Considerations
- Always use HTTPS
- Keep MongoDB Atlas IP whitelist updated
- Monitor logs for errors
- Set up proper error handling
- Consider adding rate limiting for API endpoints
- Use environment variables for sensitive data
