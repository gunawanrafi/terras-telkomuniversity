#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Port in use
    else
        return 1  # Port free
    fi
}

# Function to kill process on port
kill_port() {
    local PID=$(lsof -ti:$1)
    if [ ! -z "$PID" ]; then
        echo -e "${YELLOW}Killing process on port $1 (PID: $PID)${NC}"
        kill -9 $PID 2>/dev/null
        sleep 1
    fi
}

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  TERRAS - Starting All Services${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Check and clean up ports
echo "Checking for port conflicts..."
for port in 3001 3002 3003 5173 5174 5175; do
    if check_port $port; then
        echo -e "${YELLOW}Port $port is in use${NC}"
        kill_port $port
    fi
done

echo ""
echo -e "${GREEN}Starting Backend Services...${NC}"

# Start Auth Service
echo "  → Auth Service (port 3001)"
(cd services/auth && node server.js > /dev/null 2>&1) &
sleep 1

# Start Room Service
echo "  → Room Service (port 3002)"
(cd services/room && node server.js > /dev/null 2>&1) &
sleep 1

# Start Booking Service
echo "  → Booking Service (port 3003)"
(cd services/booking && node server.js > /dev/null 2>&1) &
sleep 1

echo ""
echo -e "${GREEN}Starting Frontend Services...${NC}"

# Start User Frontend
echo "  → User Frontend (port 5173)"
(cd services/frontend-user && npm run dev -- --port 5173 > /dev/null 2>&1) &
sleep 1

# Start Admin Frontend
echo "  → Admin Frontend (port 5174)"
(cd services/frontend-admin && npm run dev -- --port 5174 > /dev/null 2>&1) &
sleep 1

# Start Auth Frontend
echo "  → Auth Frontend (port 5175)"
(cd services/frontend-auth && npm run dev -- --port 5175 > /dev/null 2>&1) &
sleep 2

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  ✓ All Services Started!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${GREEN}Backend URLs:${NC}"
echo "  • Auth:    http://localhost:3001"
echo "  • Room:    http://localhost:3002"
echo "  • Booking: http://localhost:3003"
echo ""
echo -e "${GREEN}Frontend URLs:${NC}"
echo "  • User:  http://localhost:5173"
echo "  • Admin: http://localhost:5174"
echo "  • Auth:  http://localhost:5175"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

wait
