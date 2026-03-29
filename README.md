# Trip Management System

A full-stack web application for managing trips, bookings, and users.

## Features

- User registration and login
- JWT authentication
- View, search, and book trips
- Booking history and cancellation
- Admin panel for managing trips and bookings

## Tech Stack

- Frontend: HTML, CSS, JavaScript, Bootstrap 5
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT, bcrypt

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up MongoDB and update connection string in `backend/config/db.js`
4. Create a `.env` file in the backend folder with:
   - JWT_SECRET=your_secret_key
   - MONGO_URI=your_mongo_connection_string
5. Start the server: `npm start`

## Usage

- Open `frontend/index.html` in a browser
- Register or login
- Browse and book trips
- Admin can manage from dashboard