#!/bin/bash

# TERRAS Auto Installer
# Satu command untuk install semua!
# 
# Cara pakai:
# curl -sSL https://your-url.com/install.sh | bash
# atau
# wget -qO- https://your-url.com/install.sh | bash

echo "🚀 TERRAS Room Booking System - Auto Installer"
echo "================================================"
echo ""

# Create docker-compose.prod.yml
echo "📝 Creating docker-compose.prod.yml..."
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  mongo:
    image: mongo:7
    container_name: terras_mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - terras-network
    restart: unless-stopped

  auth-service:
    image: gunawanrafi9/terras-auth:latest
    container_name: terras_auth_service
    ports:
      - "3001:3001"
    environment:
      PORT: 3001
      JWT_SECRET: supersecretkey_change_in_production
    networks:
      - terras-network
    restart: unless-stopped

  room-service:
    image: gunawanrafi9/terras-room:latest
    container_name: terras_room_service
    ports:
      - "3002:3002"
    environment:
      PORT: 3002
      MONGODB_URI: mongodb://terras_mongo:27017/terras_rooms
    depends_on:
      - mongo
    networks:
      - terras-network
    restart: unless-stopped

  booking-service:
    image: gunawanrafi9/terras-booking:latest
    container_name: terras_booking_service
    ports:
      - "3003:3003"
    environment:
      PORT: 3003
      MONGODB_URI: mongodb://terras_mongo:27017/terras_bookings
      ROOM_SERVICE_URL: http://terras_room_service:3002
    depends_on:
      - mongo
      - room-service
    networks:
      - terras-network
    restart: unless-stopped

  frontend-user:
    image: gunawanrafi9/terras-frontend-user:latest
    container_name: terras_frontend_user
    ports:
      - "5173:80"
    networks:
      - terras-network
    restart: unless-stopped

  frontend-admin:
    image: gunawanrafi9/terras-frontend-admin:latest
    container_name: terras_frontend_admin
    ports:
      - "5174:80"
    networks:
      - terras-network
    restart: unless-stopped

  frontend-auth:
    image: gunawanrafi9/terras-frontend-auth:latest
    container_name: terras_frontend_auth
    ports:
      - "5175:80"
    networks:
      - terras-network
    restart: unless-stopped

volumes:
  mongo_data:

networks:
  terras-network:
    driver: bridge
EOF

echo "✅ File created!"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker tidak terinstall!"
    echo "Install dulu: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose tidak terinstall!"
    echo "Install dulu: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker dan Docker Compose terdeteksi"
echo ""

# Ask user if they want to start immediately
read -p "Start aplikasi sekarang? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting TERRAS..."
    docker compose -f docker-compose.prod.yml up -d
    
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    echo ""
    echo "✨ TERRAS is running!"
    echo ""
    echo "📱 Access aplikasi di:"
    echo "   User App:  http://localhost:5173"
    echo "   Admin App: http://localhost:5174"
    echo "   Auth App:  http://localhost:5175"
    echo ""
    echo "🔑 Default login:"
    echo "   Admin: admin@telkomuniversity.ac.id / admin123"
    echo "   User:  john@student.telkomuniversity.ac.id / user123"
    echo ""
    echo "📋 Useful commands:"
    echo "   Stop:     docker compose -f docker-compose.prod.yml down"
    echo "   Logs:     docker compose -f docker-compose.prod.yml logs -f"
    echo "   Status:   docker compose -f docker-compose.prod.yml ps"
else
    echo "File sudah siap! Jalankan dengan:"
    echo "  docker compose -f docker-compose.prod.yml up -d"
fi

echo ""
echo "🎉 Setup complete!"
