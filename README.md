# TERRAS - Room Booking System
### Telkom Room Reservation and Administration System

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green)](https://www.mongodb.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

A modern, microservices-based room booking system built for Telkom University with Docker containerization and Azure cloud deployment support.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### User Features
- 🏢 Browse available rooms by building and facilities
- 📅 Interactive timeline view of room schedules
- 🔍 Advanced filtering (building, capacity, time)
- 📱 Mobile-responsive design with touch scrolling
- 🎫 Create and manage bookings
- 📊 View booking history and status

### Admin Features
- 🏗️ Building and room management (CRUD)
- 👥 User management and role assignment
- ✅ Booking approval/rejection workflow
- 📈 Dashboard with booking statistics
- 🖼️ Room images and facility tagging

### System Features
- 🔐 JWT-based authentication
- 👮 Role-based access control (User/Admin)
- 🐳 Fully containerized with Docker
- ☁️ Azure cloud deployment ready
- 🔄 Automated data seeding
- 🛡️ 5-layer security architecture
- 📊 Real-time conflict detection

---

## 🏗️ Architecture

**Microservices Architecture** with separate frontend and backend services:

```
┌─────────────────────────────────────────────────────────┐
│                    User Requests                         │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────▼──────────┐
    │   Nginx (Port 80)   │  Reverse Proxy
    └──────────┬──────────┘
               │
    ┌──────────▼──────────────────────────────────┐
    │          Frontend Services                   │
    ├──────────────────────────────────────────────┤
    │  User (5173)  │  Admin (5174)  │  Auth (5175)│
    └──────────┬───────────┬──────────┬────────────┘
               │           │          │
    ┌──────────▼───────────▼──────────▼────────────┐
    │          Backend Services (Node.js)           │
    ├──────────────────────────────────────────────┤
    │  Auth (3001)  │  Room (3002)  │  Booking (3003)│
    └──────────┬───────────┬──────────┬────────────┘
               │           │          │
    ┌──────────▼───────────▼──────────▼────────────┐
    │             Databases                         │
    ├──────────────────────────────────────────────┤
    │  PostgreSQL (5432)   │   MongoDB (27017)     │
    │  Users & Auth        │   Rooms & Bookings    │
    └──────────────────────────────────────────────┘
```

For detailed architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v7
- **HTTP Client:** Fetch API
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **CORS:** cors middleware

### Databases
- **PostgreSQL 15** - User authentication and management
  - ORM: Sequelize
- **MongoDB 7** - Rooms and bookings data
  - ODM: Mongoose

### DevOps
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (reverse proxy)
- **Cloud:** Azure VM (Ubuntu 20.04)
- **Image Registry:** Docker Hub

---

## 📦 Prerequisites

**Required:**
- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- Git

**Optional:**
- Azure CLI (for cloud deployment)
- VS Code with Docker extension

**System Requirements:**
- RAM: 4GB minimum (8GB recommended)
- Storage: 10GB free space
- CPU: 2 cores minimum

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/terras-room-booking.git
cd terras-room-booking
```

### 2. Create Environment Files

```bash
# Copy example env files
cp services/frontend-user/.env.example services/frontend-user/.env
cp services/frontend-admin/.env.example services/frontend-admin/.env
cp services/frontend-auth/.env.example services/frontend-auth/.env
```

**Edit `.env` files** and update URLs for your environment (see [Configuration](#-configuration))

### 3. Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Wait for services to initialize (~30 seconds)
docker-compose logs -f
```

### 4. Access the Application

- **User App:** http://localhost:5173
- **Admin App:** http://localhost:5174
- **Auth App:** http://localhost:5175

### Default Credentials

**Admin Account:**
```
Email: admin@telkomuniversity.ac.id
Password: admin123
```

**User Account:**
```
Email: john@student.telkomuniversity.ac.id
Password: user123
```

---

## 📁 Project Structure

```
terras-room-booking/
├── services/
│   ├── auth/                 # Authentication service
│   │   ├── server.js         # Express server
│   │   ├── Dockerfile        # Container config
│   │   └── package.json
│   ├── room/                 # Room management service
│   │   ├── server.js
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── booking/              # Booking service
│   │   ├── server.js
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── frontend-user/        # User interface
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── package.json
│   ├── frontend-admin/       # Admin dashboard
│   │   └── ...
│   └── frontend-auth/        # Login/Register UI
│       └── ...
├── docker-compose.yml        # Development setup
├── docker-compose.prod.yml   # Production setup
├── .gitignore
├── README.md
└── ARCHITECTURE.md
```

---

## ⚙️ Configuration

### Frontend Environment Variables

Each frontend service needs these environment variables:

**`services/frontend-user/.env`:**
```env
VITE_API_URL=http://localhost:3001
VITE_ROOM_SERVICE=http://localhost:3002
VITE_BOOKING_SERVICE=http://localhost:3003
VITE_AUTH_APP_URL=http://localhost:5175
VITE_USER_APP_URL=http://localhost:5173
VITE_ADMIN_APP_URL=http://localhost:5174
```

**For production/cloud deployment**, replace `localhost` with your domain:
```env
VITE_API_URL=http://your-domain.com:3001
# or with reverse proxy:
VITE_API_URL=http://your-domain.com/api/auth
```

### Backend Environment Variables

**Auth Service (PostgreSQL connection):**
```env
PORT=3001
DB_NAME=terras_auth
DB_USER=postgres
DB_PASS=postgres
DB_HOST=postgres
JWT_SECRET=your-secret-key-change-this
```

**Room/Booking Services (MongoDB connection):**
```env
PORT=3002
MONGODB_URI=mongodb://mongo:27017/terras_rooms
```

---

## 🌐 Deployment

### Local Deployment (Development)

```bash
docker-compose up -d
```

### Production Deployment (Azure VM)

**1. Provision Azure VM:**
```bash
# Create VM
az vm create \
  --resource-group terras-rg \
  --name terras-vm \
  --image Ubuntu20_04 \
  --size Standard_B2s \
  --public-ip-sku Standard
```

**2. Setup DNS Label (optional):**
```bash
az network public-ip update \
  --resource-group terras-rg \
  --name terras-vm-ip \
  --dns-name terras-booking
```

**3. Deploy to VM:**
```bash
# SSH to VM
ssh azureuser@YOUR_VM_IP

# Clone repo
git clone https://github.com/YOUR_USERNAME/terras-room-booking.git
cd terras-room-booking

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Start services
docker-compose up -d
```

**4. Setup Reverse Proxy:**

See [docs/nginx-setup.md](./docs/nginx-setup.md) for Nginx configuration

**5. Enable HTTPS (optional):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

For detailed deployment guide, see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## 📡 API Documentation

### Authentication API (Port 3001)

**POST `/register`** - Register new user
```json
{
  "name": "John Doe",
  "email": "john@email.com",
  "password": "password123"
}
```

**POST `/login`** - User login
```json
{
  "email": "john@email.com",
  "password": "password123"
}
```

### Room API (Port 3002)

**GET `/buildings`** - Get all buildings

**GET `/rooms`** - Get all rooms  
Query params: `building`, `capacity`, `facilities`

**POST `/rooms`** - Create room (Admin only)
```json
{
  "name": "Room 101",
  "building": "Building A",
  "capacity": 30,
  "facilities": ["Projector", "Whiteboard"]
}
```

### Booking API (Port 3003)

**GET `/bookings`** - Get all bookings  
Query params: `userId`, `roomId`, `status`

**POST `/bookings`** - Create booking
```json
{
  "roomId": "room_id",
  "userId": "user_id",
  "startTime": "2024-01-20T09:00:00Z",
  "endTime": "2024-01-20T11:00:00Z",
  "purpose": "Meeting"
}
```

For complete API documentation, see [docs/API.md](./docs/API.md)

---

## 💻 Development

### Local Development Setup

**1. Clone and install:**
```bash
git clone https://github.com/YOUR_USERNAME/terras-room-booking.git
cd terras-room-booking

# Install dependencies for each service
cd services/auth && npm install
cd ../room && npm install
cd ../booking && npm install
cd ../frontend-user && npm install
# ... repeat for other services
```

**2. Run services individually:**
```bash
# Terminal 1 - Auth service
cd services/auth
npm run dev

# Terminal 2 - Room service  
cd services/room
npm run dev

# Terminal 3 - Frontend
cd services/frontend-user
npm run dev
```

**3. Or use Docker:**
```bash
docker-compose up
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific service tests
cd services/auth
npm test
```

### Code Style

We use ESLint and Prettier:
```bash
npm run lint
npm run format
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on specific port
sudo lsof -ti:5173 | xargs kill -9
```

### Docker Containers Not Starting
```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Errors
```bash
# Check if databases are running
docker ps | grep -E 'mongo|postgres'

# Restart databases
docker-compose restart mongo postgres
```

### Frontend Can't Connect to Backend
- Check `.env` files have correct URLs
- Verify backend services are running: `curl http://localhost:3001/health`
- Check CORS settings in backend services

For more issues, see [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - Initial work - [GitHub](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- Telkom University for project inspiration
- React and Node.js communities
- Docker and Azure documentation

---

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

**Made with ❤️ for Telkom University**
