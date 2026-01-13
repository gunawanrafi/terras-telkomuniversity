#!/bin/bash

# Debug Script - Cek Kenapa Frontend Belum Connect ke Backend
# Jalankan ini di VM Azure untuk diagnose masalah

echo "🔍 TERRAS Debugging - Frontend to Backend Connection"
echo "===================================================="
echo ""

# 1. Cek Public IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "1️⃣  Public IP: $PUBLIC_IP"
echo ""

# 2. Cek container status
echo "2️⃣  Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep terras
echo ""

# 3. Test backend API dari VM
echo "3️⃣  Testing Backend APIs from VM:"
echo "   Auth Service:"
curl -s http://localhost:3001/health && echo "   ✅ Auth service OK" || echo "   ❌ Auth service DOWN"

echo "   Room Service:"
curl -s http://localhost:3002/rooms | head -c 50 && echo "   ✅ Room service OK" || echo "   ❌ Room service DOWN"

echo "   Booking Service:"
curl -s http://localhost:3003/bookings | head -c 50 && echo "   ✅ Booking service OK" || echo "   ❌ Booking service DOWN"
echo ""

# 4. Cek .env files frontend
echo "4️⃣  Frontend .env Configuration:"
echo "   Frontend Auth:"
cat services/frontend-auth/.env 2>/dev/null || echo "   ❌ .env file not found"
echo ""

# 5. Cek actual frontend build configuration
echo "5️⃣  Checking if frontend was rebuilt:"
docker logs terras_frontend_auth 2>&1 | grep -i "vite" | tail -3
echo ""

# 6. Test dari browser perspective (CORS)
echo "6️⃣  Testing CORS from external IP:"
curl -H "Origin: http://${PUBLIC_IP}:5175" -I http://${PUBLIC_IP}:3001/health 2>&1 | grep -i "access-control"
echo ""

# 7. Cek logs untuk error
echo "7️⃣  Recent Backend Errors:"
docker logs terras_auth_service 2>&1 | tail -10
echo ""

echo "=================================================="
echo "📋 DIAGNOSIS RESULTS:"
echo ""
echo "Run these commands to see detailed logs:"
echo "  docker logs terras_auth_service"
echo "  docker logs terras_room_service"
echo "  docker logs terras_booking_service"
echo "  docker logs terras_frontend_auth"
echo ""
echo "To completely rebuild and restart:"
echo "  ./fix-frontend-vm.sh"
