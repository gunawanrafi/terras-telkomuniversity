#!/bin/bash

# TERRAS Local Testing Script
# Script untuk mensimulasikan deployment di local menggunakan Docker Compose

set -e

echo "🚀 TERRAS Local Deployment Testing"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean up previous containers
echo -e "${YELLOW}[1/6] Cleaning up previous containers...${NC}"
docker compose down -v 2>/dev/null || true
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Step 2: Build all images
echo -e "${YELLOW}[2/6] Building all Docker images...${NC}"
docker compose build --no-cache
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Step 3: Start all containers
echo -e "${YELLOW}[3/6] Starting all containers...${NC}"
docker compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Step 4: Wait for services to be ready
echo -e "${YELLOW}[4/6] Waiting for services to be ready...${NC}"
sleep 10

# Check if containers are running
echo "Checking container status..."
docker compose ps

# Step 5: Health checks
echo ""
echo -e "${YELLOW}[5/6] Running health checks...${NC}"

# Check PostgreSQL
echo -n "PostgreSQL: "
if docker exec terras_postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${RED}✗ Not ready${NC}"
fi

# Check MongoDB
echo -n "MongoDB: "
if docker exec terras_mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${RED}✗ Not ready${NC}"
fi

# Check Auth Service
echo -n "Auth Service: "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${YELLOW}⚠ Not responding (might need more time)${NC}"
fi

# Check Room Service
echo -n "Room Service: "
if curl -s http://localhost:3002/rooms > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${YELLOW}⚠ Not responding (might need more time)${NC}"
fi

# Check Booking Service
echo -n "Booking Service: "
if curl -s http://localhost:3003/bookings > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${YELLOW}⚠ Not responding (might need more time)${NC}"
fi

# Check Frontend Services
echo -n "User Frontend: "
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${YELLOW}⚠ Not responding${NC}"
fi

echo -n "Admin Frontend: "
if curl -s http://localhost:5174 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${YELLOW}⚠ Not responding${NC}"
fi

echo -n "Auth Frontend: "
if curl -s http://localhost:5175 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${YELLOW}⚠ Not responding${NC}"
fi

# Step 6: Display access URLs
echo ""
echo -e "${YELLOW}[6/6] Deployment complete!${NC}"
echo ""
echo "===================================="
echo -e "${GREEN}Access your application:${NC}"
echo "===================================="
echo "User App:   http://localhost:5173"
echo "Admin App:  http://localhost:5174"
echo "Auth App:   http://localhost:5175"
echo ""
echo "Backend APIs:"
echo "Auth:       http://localhost:3001"
echo "Room:       http://localhost:3002"
echo "Booking:    http://localhost:3003"
echo ""
echo "Databases:"
echo "PostgreSQL: localhost:5432"
echo "MongoDB:    localhost:27017"
echo "===================================="
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "View logs:        docker compose logs -f"
echo "Stop all:         docker compose down"
echo "Restart service:  docker compose restart <service-name>"
echo "View status:      docker compose ps"
echo ""
echo -e "${GREEN}Happy testing! 🎉${NC}"
