# API Documentation

Complete REST API reference for TERRAS Room Booking System.

---

## Base URLs

**Development:**
```
Auth Service:    http://localhost:3001
Room Service:    http://localhost:3002
Booking Service: http://localhost:3003
```

**Production (with reverse proxy):**
```
Auth API:    http://your-domain.com/api/auth
Room API:    http://your-domain.com/api/rooms
Booking API: http://your-domain.com/api/bookings
```

---

## Authentication

All protected endpoints require JWT token in header:

```http
Authorization: Bearer <your-jwt-token>
```

---

## Auth Service API (Port 3001)

### Register User

**POST** `/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@student.telkomuniversity.ac.id",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@student.telkomuniversity.ac.id",
    "role": "user"
  }
}
```

---

### Login

**POST** `/login`

**Request Body:**
```json
{
  "email": "john@student.telkomuniversity.ac.id",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@student.telkomuniversity.ac.id",
    "role": "user"
  }
}
```

---

### Get All Users

**GET** `/users` 🔒 Admin only

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@student.telkomuniversity.ac.id",
    "role": "user",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

---

### Update User Role

**PUT** `/users/:id/role` 🔒 Admin only

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "message": "User role updated",
  "user": {
    "id": 1,
    "role": "admin"
  }
}
```

---

## Room Service API (Port 3002)

### Get All Buildings

**GET** `/buildings`

**Response (200):**
```json
[
  "GKU",
  "TULT",
  "Cacuk",
  "TUCH"
]
```

---

### Get All Rooms

**GET** `/rooms`

**Query Parameters:**
- `building` (optional): Filter by building name
- `capacity` (optional): Minimum capacity
- `facilities` (optional): Comma-separated list

**Example:**
```
GET /rooms?building=GKU&capacity=30&facilities=Projector,AC
```

**Response (200):**
```json
[
  {
    "_id": "65a1b2c3d4e5f6789012345",
    "code": "GKU-101",
    "name": "Seruni Kempis Lantai 3",
    "building": "GKU",
    "capacity": 30,
    "facilities": ["Proyektor", "AC", "Whiteboard"],
    "image": "/room1.jpg",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

---

### Get Room by ID

**GET** `/rooms/:id`

**Response (200):**
```json
{
  "_id": "65a1b2c3d4e5f6789012345",
  "code": "GKU-101",
  "name": "Seruni Kempis Lantai 3",
  "building": "GKU",
  "capacity": 30,
  "facilities": ["Proyektor", "AC"],
  "image": "/room1.jpg"
}
```

---

### Create Room

**POST** `/rooms` 🔒 Admin only

**Request Body:**
```json
{
  "code": "GKU-102",
  "name": "New Room",
  "building": "GKU",
  "capacity": 40,
  "facilities": ["Projector", "AC"],
  "image": "/room-new.jpg"
}
```

**Response (201):**
```json
{
  "message": "Room created successfully",
  "room": { ... }
}
```

---

### Update Room

**PUT** `/rooms/:id` 🔒 Admin only

**Request Body:**
```json
{
  "name": "Updated Room Name",
  "capacity": 35
}
```

**Response (200):**
```json
{
  "message": "Room updated successfully",
  "room": { ... }
}
```

---

### Delete Room

**DELETE** `/rooms/:id` 🔒 Admin only

**Response (200):**
```json
{
  "message": "Room deleted successfully"
}
```

---

## Booking Service API (Port 3003)

### Get All Bookings

**GET** `/bookings`

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `roomId` (optional): Filter by room ID
- `status` (optional): pending|approved|rejected
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Example:**
```
GET /bookings?status=pending&roomId=65a1b2c3d4e5f6789012345
```

**Response (200):**
```json
[
  {
    "_id": "65a1b2c3d4e5f6789abcdef",
    "userId": "1",
    "userName": "John Doe",
    "userEmail": "john@student.telkomuniversity.ac.id",
    "roomId": "65a1b2c3d4e5f6789012345",
    "roomName": "Seruni Kempis Lantai 3",
    "startTime": "2024-01-20T09:00:00.000Z",
    "endTime": "2024-01-20T11:00:00.000Z",
    "jamMulai": "09:00",
    "jamSelesai": "11:00",
    "namaKegiatan": "Team Meeting",
    "jenisKegiatan": "Rapat",
    "deskripsiKegiatan": "Monthly team sync",
    "status": "pending",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

---

### Create Booking

**POST** `/bookings` 🔒 Authenticated

**Request Body:**
```json
{
  "roomId": "65a1b2c3d4e5f6789012345",
  "startTime": "2024-01-20T09:00:00.000Z",
  "endTime": "2024-01-20T11:00:00.000Z",
  "jamMulai": "09:00",
  "jamSelesai": "11:00",
  "namaKegiatan": "Team Meeting",
  "jenisKegiatan": "Rapat",
  "deskripsiKegiatan": "Monthly team sync",
  "lampiran": "optional-file-path.pdf"
}
```

**Response (201):**
```json
{
  "message": "Booking created successfully",
  "booking": { ... }
}
```

**Error (409 Conflict):**
```json
{
  "message": "Room is already booked for this time slot"
}
```

---

### Get Booking by ID

**GET** `/bookings/:id`

**Response (200):**
```json
{
  "_id": "65a1b2c3d4e5f6789abcdef",
  "userId": "1",
  "roomId": "65a1b2c3d4e5f6789012345",
  ...
}
```

---

### Update Booking Status

**PUT** `/bookings/:id/status` 🔒 Admin only

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid statuses:** `pending`, `approved`, `rejected`

**Response (200):**
```json
{
  "message": "Booking status updated",
  "booking": { ... }
}
```

---

### Delete Booking

**DELETE** `/bookings/:id` 🔒 Owner or Admin

**Response (200):**
```json
{
  "message": "Booking deleted successfully"
}
```

---

## Error Responses

All endpoints may return these error formats:

### 400 Bad Request
```json
{
  "message": "Invalid request data",
  "errors": ["Email is required", "Password too short"]
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided" | "Invalid token"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Admin only."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- 100 requests/minute per IP
- 1000 requests/hour per user

---

## Testing APIs

### Using cURL

```bash
# Register
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Login and save token
TOKEN=$(curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}' \
  | jq -r '.token')

# Get rooms with auth
curl http://localhost:3002/rooms \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. Import collection from `/docs/postman-collection.json`  
2. Set environment variable `baseUrl`
3. Tests include auto-save of JWT token

---

**For code examples, see source in `services/*/server.js`**
