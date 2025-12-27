#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}  TERRAS - Stopping All Services${NC}"
echo -e "${YELLOW}======================================${NC}"
echo ""

# Function to kill process on port
kill_port() {
    local PID=$(lsof -ti:$1 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo -e "  ${GREEN}✓${NC} Stopping service on port $1 (PID: $PID)"
        kill -9 $PID 2>/dev/null
        return 0
    else
        echo -e "  ${YELLOW}○${NC} No service running on port $1"
        return 1
    fi
}

# Stop all services
echo "Stopping Backend Services..."
kill_port 3001  # Auth
kill_port 3002  # Room
kill_port 3003  # Booking

echo ""
echo "Stopping Frontend Services..."
kill_port 5173  # User
kill_port 5174  # Admin
kill_port 5175  # Auth

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  ✓ All Services Stopped!${NC}"
echo -e "${GREEN}======================================${NC}"
