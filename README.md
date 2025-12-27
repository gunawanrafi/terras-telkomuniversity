# TERRAS - Room Booking System
**Telkom University Room Reservation & Administration System**

A comprehensive room booking management system built with microservices architecture, featuring separate frontends for users and administrators, powered by MongoDB and PostgreSQL databases.

## 🚀 Features

### User Features
- **Room Browsing**: View available rooms with detailed information and images
- **Multi-Day Booking**: Book rooms for single or multiple consecutive days
- **Time Selection**: Flexible time slot selection with 24-hour format
- **Schedule View**: Check room availability by date with visual timeline
- **Booking Management**: Track booking status (pending, approved, rejected)
- **File Upload**: Attach supporting documents (PDF, DOC, DOCX, max 5MB)
- **Conflict Detection**: Automatic detection of scheduling conflicts

### Admin Features  
- **Booking Approvals**: Review and approve/reject pending bookings
- **Room Management**: Add, edit, and delete rooms and buildings
- **User Management**: View and manage registered users
- **Dashboard Analytics**: Overview of system statistics
- **Activity Logging**: Track admin actions and system events

### Technical Features
- ✅ **Multi-day conflict detection** - Prevents overlapping bookings across date ranges
- ✅ **Real-time validation** - Instant feedback on booking conflicts
- ✅ **Microservices architecture** - Scalable and maintainable design
- ✅ **RESTful APIs** - Clean API design for all services
- ✅ **Responsive UI** - Works on desktop, tablet, and mobile devices

## 📁 Project Structure

```
UASfix/
├── services/                    # Microservices
│   ├── auth/                   # Authentication (PostgreSQL)
│   ├── booking/                # Booking management (MongoDB)
│   ├── room/                   # Room management (MongoDB)
│   ├── frontend-user/          # User interface (React)
│   ├── frontend-admin/         # Admin interface (React)
│   └── frontend-auth/          # Auth interface (React)
├── packages/                    # Shared packages
│   ├── core/                   # Services & utilities
│   └── ui/                     # Shared UI components
├── public/                      # Static assets
├── start-all.sh                # Start all services
├── stop-all.sh                 # Stop all services
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Databases**: 
  - MongoDB (Rooms & Bookings)
  - PostgreSQL (Authentication)
- **ODM/ORM**: Mongoose, Sequelize

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Router**: React Router v7
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **State Management**: React Hooks + Context API

## 📋 Prerequisites

- **Node.js**: v20.x or higher
- **MongoDB**: v7.x or higher
- **PostgreSQL**: v16.x or higher
- **npm**: v10.x or higher

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd UASfix
```

### 2. Install Dependencies

Install backend dependencies:
```bash
cd services/auth && npm install && cd ../..
cd services/room && npm install && cd ../..
cd services/booking && npm install && cd ../..
```

Install frontend dependencies:
```bash
cd services/frontend-user && npm install && cd ../..
cd services/frontend-admin && npm install && cd ../..
cd services/frontend-auth && npm install && cd ../..
```

### 3. Configure Environment

Create `.env` files in each service directory (already configured):

**services/auth/.env**:
```env
PORT=3001
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=terras_auth
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

**services/room/.env**:
```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/terras_rooms
```

**services/booking/.env**:
```env
PORT=3003
MONGODB_URI=mongodb://localhost:27017/terras_bookings
ROOM_SERVICE_URL=http://localhost:3002
```

**services/frontend-*/.env**:
```env
VITE_API_URL=http://localhost:3001
VITE_ROOM_SERVICE=http://localhost:3002
VITE_BOOKING_SERVICE=http://localhost:3003
VITE_AUTH_APP_URL=http://localhost:5175
VITE_USER_APP_URL=http://localhost:5173
VITE_ADMIN_APP_URL=http://localhost:5174
```

### 4. Start All Services

Use the provided script to start everything:
```bash
./start-all.sh
```

This will start:
- **Backend Services** on ports 3001, 3002, 3003
- **Frontend Services** on ports 5173, 5174, 5175

### 5. Access the Applications

- **User App**: http://localhost:5173
- **Admin App**: http://localhost:5174  
- **Auth (Login/Register)**: http://localhost:5175

### 6. Stop All Services

```bash
./stop-all.sh
```

Or press `Ctrl+C` in the terminal running start-all.sh

## 📊 Database Setup

### MongoDB
No initial setup required. Databases and collections are created automatically on first run.

### PostgreSQL
Create the database:
```sql
CREATE DATABASE terras_auth;
```

Tables are created automatically by Sequelize on first run.

## 🔐 Default Admin Account

After first run, you can create an admin account via the registration page, then manually update the role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## 📝 API Endpoints

### Authentication Service (Port 3001)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/verify` - Verify JWT token
- `GET /users` - Get all users (admin only)

### Room Service (Port 3002)
- `GET /rooms` - Get all rooms
- `GET /rooms/:id` - Get room by ID
- `POST /rooms` - Create room (admin only)
- `PUT /rooms/:id` - Update room (admin only)
- `DELETE /rooms/:id` - Delete room (admin only)
- `GET /buildings` - Get all buildings
- `POST /buildings` - Create building (admin only)

### Booking Service (Port 3003)
- `GET /bookings` - Get all bookings (with filters)
- `GET /bookings?userId=X` - Get user bookings
- `GET /bookings?roomId=X` - Get room bookings
- `POST /bookings` - Create booking
- `PATCH /bookings/:id/status` - Approve/reject booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Delete booking

## 🐛 Troubleshooting

### Port Already in Use
The `start-all.sh` script automatically kills processes on required ports. If you see errors, try:
```bash
./stop-all.sh
./start-all.sh
```

### Database Connection Errors
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check connection strings in `.env` files

### Login/Logout Issues
- Clear browser cache and localStorage
- Ensure all frontend services are running on correct ports
- Check browser console for errors

## 🎯 Usage Guide

### Making a Booking (User)
1. Browse available rooms on home page
2. Click "Booking Sekarang" on desired room
3. Select date range and time
4. Fill in activity details
5. Upload supporting document (optional)
6. Submit and wait for admin approval

### Approving Bookings (Admin)
1. Login as admin
2. Go to "Persetujuan" page
3. Review booking details
4. Click "Setujui" to approve or "Tolak" to reject
5. If rejecting, provide a reason

### Managing Rooms (Admin)
1. Go to "Kelola Ruangan"
2. Add buildings first
3. Add rooms with details and images
4. Edit or delete as needed

## 🚨 Known Issues & Fixes

✅ **Multi-day booking conflicts** - FIXED: Each day in range is now checked individually  
✅ **Logout redirect loop** - FIXED: Proper redirect to auth service URL  
✅ **Port conflicts on restart** - FIXED: Auto-cleanup in start script  
✅ **localStorage persistence** - FIXED: Now using MongoDB backend  

## 📄 License

This project is for educational purposes as part of UAS (Final Exam) project.

## 👥 Contributors

- Development Team
- Telkom University

## 📞 Support

For issues or questions, please contact the development team.

---

**Last Updated**: 2025-12-27  
**Version**: 1.0.0
