# TERRAS System Architecture

Detailed technical architecture documentation for the TERRAS Room Booking System.

---

## Overview

TERRAS follows a **microservices architecture** pattern with clear separation of concerns between frontend interfaces and backend services. The system is fully containerized using Docker and designed for cloud deployment.

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

Three separate React applications handle different user roles:

**User Frontend (Port 5173)**
- Room browsing and filtering
- Interactive booking interface
- Personal booking management
- Timeline view of schedules

**Admin Frontend (Port 5174)**
- Room and building management
- User management
- Booking approval workflow
- Statistics dashboard

**Auth Frontend (Port 5175)**
- User registration
- Login/logout
- Password management

**Technology Stack:**
- React 18 with hooks
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation

### 2. Application Layer (Backend Services)

Three Node.js microservices handle business logic:

**Auth Service (Port 3001)**
- User authentication with JWT
- Password hashing with bcrypt
- Token validation
- User management
- Database: PostgreSQL

**Room Service (Port 3002)**
- Room CRUD operations
- Building management
- Facility tagging
- Automated data seeding
- Database: MongoDB

**Booking Service (Port 3003)**
- Booking creation and management
- Conflict detection
- Status workflow (pending → approved/rejected)
- Query by user, room, date
- Database: MongoDB

**Technology Stack:**
- Node.js 18
- Express.js framework
- JWT for auth
- Sequelize ORM (PostgreSQL)
- Mongoose ODM (MongoDB)

### 3. Data Layer

**PostgreSQL (Port 5432)**
- User accounts
- Authentication data
- Schema-based relational data
- ACID compliance

**MongoDB (Port 27017)**
- Rooms collection
- Bookings collection
- Buildings collection
- Flexible document structure

---

## Security Architecture

Five-layer defense-in-depth security:

```
Layer 1: Azure NSG (Network Security Group)
         ↓ Firewall rules, port filtering
Layer 2: JWT Token Authentication  
         ↓ User identity verification
Layer 3: Role-Based Access Control
         ↓ Permission checking (User/Admin)
Layer 4: CORS Policy
         ↓ Origin validation
Layer 5: Input Validation
         ↓ SQL injection, XSS prevention
```

### Authentication Flow

```
1. User → Login (email/password)
2. Auth Service → Validate credentials
3. Auth Service → Generate JWT token
4. Client → Store token (localStorage)
5. Subsequent requests → Include token in headers
6. Backend → Verify token on each request
```

---

## Data Flow

### Room Booking Flow

```
User Frontend
    ↓ POST /bookings
Nginx Reverse Proxy (if deployed)
    ↓ Forward to localhost:3003
Booking Service
    ↓ Validate JWT
    ↓ Check room availability
    ↓ Check time conflicts
    ↓ Save to MongoDB
    ↓ Return booking confirmation
    ↓
User sees confirmation
```

### Admin Approval Flow

```
Admin Frontend
    ↓ GET /bookings?status=pending
Booking Service
    ↓ Verify admin role
    ↓ Fetch pending bookings
    ↓ Return list
    ↓
Admin reviews
    ↓ PUT /bookings/:id/approve
Booking Service
    ↓ Update status to "approved"
    ↓ Send confirmation
```

---

## Deployment Architecture

### Development (Local)

```
Docker Compose
├── Frontend Containers (3)
│   └── Nginx serving React builds
├── Backend Containers (3)
│   └── Node.js Express servers
└── Database Containers (2)
    ├── PostgreSQL
    └── MongoDB
```

### Production (Azure VM)

```
Azure VM (Ubuntu 20.04)
├── Nginx (Port 80/443)
│   ├── Reverse proxy to frontends
│   └── SSL termination (Let's Encrypt)
├── Docker Containers
│   ├── Frontends (3)
│   ├── Backends (3)
│   └── Databases (2)
└── Persistent Volumes
    ├── postgres_data
    └── mongo_data
```

---

## Database Schema

### PostgreSQL (Auth Service)

**Users Table:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

### MongoDB (Room & Booking Services)

**Rooms Collection:**
```javascript
{
  _id: ObjectId,
  code: String,        // "GKU-101"  
  name: String,        // "Seruni Kempis Lantai 3"
  building: String,    // "GKU"
  capacity: Number,    // 30
  facilities: [String], // ["Projector", "AC"]
  image: String,       // "/room1.jpg"
  createdAt: Date,
  updatedAt: Date
}
```

**Bookings Collection:**
```javascript
{
  _id: ObjectId,
  userId: String,           // From JWT
  userName: String,
  userEmail: String,
  roomId: ObjectId,
  roomName: String,
  startTime: Date,
  endTime: Date,
  jamMulai: String,         // "08:00"
  jamSelesai: String,       // "10:00"
  namaKegiatan: String,
  jenisKegiatan: String,    // "Perkuliahan"
  deskripsiKegiatan: String,
  lampiran: String,         // Optional file path
  status: String,           // "pending"|"approved"|"rejected"
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Communication

### Inter-Service Communication

Services communicate via HTTP REST APIs:

```
Frontend → Backend Service URLs (from .env)
Backend Services → Independent (no inter-service calls)
All Services → Own database connection
```

### Environment-Based Configuration

Development:
```
VITE_API_URL=http://localhost:3001
```

Production with Reverse Proxy:
```
VITE_API_URL=http://domain.com/api/auth
```

---

## Scalability Considerations

### Current Architecture
- **Single VM**: All services on one machine
- **Docker Compose**: Simple orchestration
- **Suitable for**: < 1000 concurrent users

### Future Scaling Options

**Horizontal Scaling:**
- Azure Container Apps
- Kubernetes cluster
- Load balancer for multiple instances

**Database Scaling:**
- PostgreSQL: Read replicas
- MongoDB: Sharding and replica sets
- Azure Database services

**Caching Layer:**
- Redis for session management
- Cache frequent queries (rooms list)

---

## Technology Decisions

### Why Microservices?
- Independent deployment
- Technology flexibility
- Easier debugging
- Scalability per service

### Why Docker?
- Environment consistency
- Easy onboarding
- Cloud portability
- Simplified dependencies

### Why PostgreSQL + MongoDB?
- PostgreSQL: ACID for user auth
- MongoDB: Flexibility for bookings/rooms
- Best tool for each job

### Why React?
- Component reusability
- Large ecosystem
- Fast development
- Modern tooling (Vite)

---

## Monitoring & Logging

### Current Setup
- Docker logs: `docker-compose logs`
- Console logging in services

### Recommended for Production
- Azure Application Insights
- Centralized logging (ELK stack)
- Health check endpoints
- Performance monitoring

---

## Disaster Recovery

### Backup Strategy
- Database volumes mapped to host
- Regular database dumps
- Git repositories for code

### Recovery Procedure
```bash
# Restore from backup
docker-compose down
docker volume rm postgres_data mongo_data
# Restore volume from backup
docker-compose up -d
```

---

**For implementation details, see source code in `services/` directory.**
