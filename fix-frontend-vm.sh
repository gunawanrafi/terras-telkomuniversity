#!/bin/bash

# Fix Frontend URLs untuk VM Deployment - FINAL VERSION
# Script ini akan rebuild frontend dengan IP VM yang benar

echo "🔧 TERRAS Frontend Fix for VM Deployment"
echo "========================================"

# Auto-detect project directory (must have both docker-compose.prod.yml AND services folder)
echo "📁 Finding project directory..."

# Find all directories with docker-compose.prod.yml
CANDIDATES=$(find ~ -name "docker-compose.prod.yml" -exec dirname {} \; 2>/dev/null)

PROJECT_DIR=""
for dir in $CANDIDATES; do
    if [ -d "$dir/services" ]; then
        PROJECT_DIR="$dir"
        break
    fi
done

if [ -z "$PROJECT_DIR" ]; then
    echo "❌ Error: Cannot find project with docker-compose.prod.yml and services/ folder"
    echo ""
    echo "Please check:"
    echo "  1. docker-compose.prod.yml exists"
    echo "  2. services/ folder exists in the same directory"
    echo ""
    echo "Or run this script from the project directory manually:"
    echo "  cd /path/to/project && ./fix-frontend-vm.sh"
    exit 1
fi

cd "$PROJECT_DIR"
echo "✅ Found project at: $PROJECT_DIR"

# Verify required files exist
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found in $PROJECT_DIR"
    exit 1
fi

if [ ! -d "services/frontend-user" ]; then
    echo "❌ Error: services/frontend-user directory not found"
    exit 1
fi

# Get Public IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "🌐 Detected Public IP: $PUBLIC_IP"
echo ""

# Stop running containers
echo "⏸️  Stopping containers..."
docker-compose -f docker-compose.prod.yml down

# Create/Update .env files with correct VM IP
echo "📝 Updating .env files for all frontends..."

# Frontend User
cat > services/frontend-user/.env << EOF
VITE_API_URL=http://${PUBLIC_IP}:3001
VITE_ROOM_SERVICE=http://${PUBLIC_IP}:3002
VITE_BOOKING_SERVICE=http://${PUBLIC_IP}:3003
VITE_AUTH_APP_URL=http://${PUBLIC_IP}:5175
VITE_USER_APP_URL=http://${PUBLIC_IP}:5173
VITE_ADMIN_APP_URL=http://${PUBLIC_IP}:5174
EOF
echo "✅ Updated frontend-user/.env"

# Frontend Admin
cat > services/frontend-admin/.env << EOF
VITE_API_URL=http://${PUBLIC_IP}:3001
VITE_ROOM_SERVICE=http://${PUBLIC_IP}:3002
VITE_BOOKING_SERVICE=http://${PUBLIC_IP}:3003
VITE_AUTH_APP_URL=http://${PUBLIC_IP}:5175
VITE_USER_APP_URL=http://${PUBLIC_IP}:5173
VITE_ADMIN_APP_URL=http://${PUBLIC_IP}:5174
EOF
echo "✅ Updated frontend-admin/.env"

# Frontend Auth
cat > services/frontend-auth/.env << EOF
VITE_API_URL=http://${PUBLIC_IP}:3001
VITE_AUTH_APP_URL=http://${PUBLIC_IP}:5175
VITE_USER_APP_URL=http://${PUBLIC_IP}:5173
VITE_ADMIN_APP_URL=http://${PUBLIC_IP}:5174
EOF
echo "✅ Updated frontend-auth/.env"

# Verify .env files
echo ""
echo "📄 Verifying .env file:"
cat services/frontend-auth/.env
echo ""

echo "🏗️  Rebuilding frontend services..."
# Remove old images first to force fresh build
docker rmi -f uasfix-frontend-user:latest uasfix-frontend-admin:latest uasfix-frontend-auth:latest 2>/dev/null || true

# Build using docker-compose.prod.yml as config file
docker-compose -f docker-compose.prod.yml build frontend-user
docker-compose -f docker-compose.prod.yml build frontend-admin
docker-compose -f docker-compose.prod.yml build frontend-auth

echo ""
echo "🔄 Updating docker-compose.prod.yml to use local images..."
# Replace Docker Hub images with local build images
sed -i.bak 's|gunawanrafi9/terras-frontend-user:latest|uasfix-frontend-user:latest|g' docker-compose.prod.yml
sed -i.bak 's|gunawanrafi9/terras-frontend-admin:latest|uasfix-frontend-admin:latest|g' docker-compose.prod.yml
sed -i.bak 's|gunawanrafi9/terras-frontend-auth:latest|uasfix-frontend-auth:latest|g' docker-compose.prod.yml
echo "✅ docker-compose.prod.yml updated to use local images"

echo ""
echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 20

echo ""
echo "✅ Done! Services are now running with correct URLs"
echo ""
echo "📱 Access your application at:"
echo "   User App:  http://${PUBLIC_IP}:5173"
echo "   Admin App: http://${PUBLIC_IP}:5174"
echo "   Auth App:  http://${PUBLIC_IP}:5175"
echo ""
echo "🔑 Try logging in with:"
echo "   Admin: admin@telkomuniversity.ac.id / admin123"
echo "   User:  john@student.telkomuniversity.ac.id / user123"
echo ""
echo "🎉 All set! Register/Login should work now!"
