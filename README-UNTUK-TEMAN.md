# 🚀 TERRAS - Panduan Instalasi untuk Teman

Aplikasi TERRAS Room Booking System sudah siap pakai! Semua images sudah tersedia di Docker Hub.

## 📋 Prerequisites

Yang kamu butuhkan cuma:
- Docker
- Docker Compose

Itu aja! Gak perlu install Node.js, MongoDB, atau apapun.

## 🎯 Cara Install (Super Simple!)

### 1. Download File

Download file `docker-compose.prod.yml` aja. Taruh di folder manapun yang kamu mau.

### 2. Jalankan!

```bash
# Masuk ke folder tempat kamu taruh docker-compose.prod.yml
cd /path/to/folder

# Jalankan semua services (auto pull images dari Docker Hub)
docker compose -f docker-compose.prod.yml up -d
```

**Itu aja!** Docker akan otomatis:
- ✅ Download semua images dari Docker Hub
- ✅ Start database (MongoDB)
- ✅ Start backend services (auth, room, booking)
- ✅ Start frontend apps (user, admin, auth)

### 3. Tunggu 1-2 menit

Tunggu sampai semua container running. Cek dengan:
```bash
docker compose -f docker-compose.prod.yml ps
```

### 4. Akses Aplikasi

Buka browser:
- **User App**: http://localhost:5173
- **Admin App**: http://localhost:5174
- **Auth (Login/Register)**: http://localhost:5175

## 🎮 Testing

1. Buka http://localhost:5175
2. Register akun baru
3. Login
4. Browse rooms di User App
5. Buat booking
6. Done! ✨

## 🛑 Stop Aplikasi

```bash
docker compose -f docker-compose.prod.yml down
```

## 🗑️ Hapus Semua (termasuk data)

```bash
docker compose -f docker-compose.prod.yml down -v
```

## 📊 Ukuran Download

Total download sekitar:
- Backend services: ~250MB x 3 = 750MB
- Frontend services: ~110MB x 3 = 330MB
- MongoDB: ~700MB
- **Total: ~1.8GB**

## 🐛 Troubleshooting

### Port sudah dipakai
Kalau ada error "port already in use":
```bash
# Cek apa yang pakai port tersebut
sudo lsof -i :5173
sudo lsof -i :5174
sudo lsof -i :5175
sudo lsof -i :3001
sudo lsof -i :3002
sudo lsof -i :3003

# Atau stop dulu
docker compose -f docker-compose.prod.yml down
```

### Images tidak ter-download
```bash
# Pull manual semua images dulu
docker pull gunawanrafi9/terras-auth:latest
docker pull gunawanrafi9/terras-room:latest
docker pull gunawanrafi9/terras-booking:latest
docker pull gunawanrafi9/terras-frontend-user:latest
docker pull gunawanrafi9/terras-frontend-admin:latest
docker pull gunawanrafi9/terras-frontend-auth:latest
docker pull mongo:7

# Lalu jalankan lagi
docker compose -f docker-compose.prod.yml up -d
```

## 📝 Info Akun Default

Setelah pertama kali running, ada 2 default users:

**Regular User:**
- Email: `john@student.telkomuniversity.ac.id`
- Password: `user123`

**Admin:**
- Email: `admin@telkomuniversity.ac.id`
- Password: `admin123`

## 🔥 Quick Commands

```bash
# Start
docker compose -f docker-compose.prod.yml up -d

# Stop
docker compose -f docker-compose.prod.yml down

# Lihat logs
docker compose -f docker-compose.prod.yml logs -f

# Restart service tertentu
docker compose -f docker-compose.prod.yml restart auth-service

# Lihat status
docker compose -f docker-compose.prod.yml ps
```

## 🎓 Struktur Services

```
TERRAS Application
├── Frontend Apps
│   ├── User App (5173)      - Browse & Book Rooms
│   ├── Admin App (5174)     - Manage Bookings & Rooms
│   └── Auth App (5175)      - Login & Register
│
├── Backend APIs
│   ├── Auth Service (3001)     - Authentication
│   ├── Room Service (3002)     - Room Management
│   └── Booking Service (3003)  - Booking Management
│
└── Database
    └── MongoDB (27017)         - Data Storage
```

## 💡 Tips

1. **Jangan lupa login dulu** di http://localhost:5175 sebelum akses User App atau Admin App
2. **Kalau mau reset data**, jalankan `docker compose -f docker-compose.prod.yml down -v` lalu `up` lagi
3. **Windows users**: Pastikan Docker Desktop sudah running

---

**Happy coding! 🚀**

Dibuat oleh: [@gunawanrafi9](https://hub.docker.com/u/gunawanrafi9)
