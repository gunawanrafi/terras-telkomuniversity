#!/bin/bash

# TERRAS Push to Azure Container Registry Script
# Script untuk tag dan push semua images ke ACR

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Push TERRAS Images to Azure Container Registry"
echo "=================================================="
echo ""

# Check if ACR_NAME is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: ACR name is required${NC}"
    echo "Usage: ./push-to-acr.sh <acr-name>"
    echo "Example: ./push-to-acr.sh terrasregistry"
    exit 1
fi

ACR_NAME=$1
ACR_URL="${ACR_NAME}.azurecr.io"

echo "ACR Name: $ACR_NAME"
echo "ACR URL:  $ACR_URL"
echo ""

# Step 1: Login to ACR
echo -e "${YELLOW}[1/4] Logging in to Azure Container Registry...${NC}"
az acr login --name $ACR_NAME
echo -e "${GREEN}✓ Login successful${NC}"
echo ""

# Step 2: Tag images
echo -e "${YELLOW}[2/4] Tagging images...${NC}"

# Backend services
docker tag terras_auth_service:latest ${ACR_URL}/auth-service:latest
echo "✓ Tagged auth-service"

docker tag terras_room_service:latest ${ACR_URL}/room-service:latest
echo "✓ Tagged room-service"

docker tag terras_booking_service:latest ${ACR_URL}/booking-service:latest
echo "✓ Tagged booking-service"

# Frontend services
docker tag terras_frontend_user:latest ${ACR_URL}/frontend-user:latest
echo "✓ Tagged frontend-user"

docker tag terras_frontend_admin:latest ${ACR_URL}/frontend-admin:latest
echo "✓ Tagged frontend-admin"

docker tag terras_frontend_auth:latest ${ACR_URL}/frontend-auth:latest
echo "✓ Tagged frontend-auth"

# Database images (optional)
echo ""
read -p "Do you want to push database images too? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker tag postgres:15 ${ACR_URL}/postgres:15
    echo "✓ Tagged postgres"
    
    docker tag mongo:7 ${ACR_URL}/mongo:7
    echo "✓ Tagged mongo"
    PUSH_DB=true
else
    PUSH_DB=false
fi

echo -e "${GREEN}✓ All images tagged${NC}"
echo ""

# Step 3: Push images
echo -e "${YELLOW}[3/4] Pushing images to ACR...${NC}"
echo "This may take several minutes..."
echo ""

docker push ${ACR_URL}/auth-service:latest
echo -e "${GREEN}✓ Pushed auth-service${NC}"

docker push ${ACR_URL}/room-service:latest
echo -e "${GREEN}✓ Pushed room-service${NC}"

docker push ${ACR_URL}/booking-service:latest
echo -e "${GREEN}✓ Pushed booking-service${NC}"

docker push ${ACR_URL}/frontend-user:latest
echo -e "${GREEN}✓ Pushed frontend-user${NC}"

docker push ${ACR_URL}/frontend-admin:latest
echo -e "${GREEN}✓ Pushed frontend-admin${NC}"

docker push ${ACR_URL}/frontend-auth:latest
echo -e "${GREEN}✓ Pushed frontend-auth${NC}"

if [ "$PUSH_DB" = true ]; then
    docker push ${ACR_URL}/postgres:15
    echo -e "${GREEN}✓ Pushed postgres${NC}"
    
    docker push ${ACR_URL}/mongo:7
    echo -e "${GREEN}✓ Pushed mongo${NC}"
fi

echo ""
echo -e "${GREEN}✓ All images pushed successfully${NC}"
echo ""

# Step 4: Verify
echo -e "${YELLOW}[4/4] Verifying images in ACR...${NC}"
az acr repository list --name $ACR_NAME --output table

echo ""
echo "=================================================="
echo -e "${GREEN}Push complete! 🎉${NC}"
echo "=================================================="
echo ""
echo "Your images are now available at:"
echo "${ACR_URL}/auth-service:latest"
echo "${ACR_URL}/room-service:latest"
echo "${ACR_URL}/booking-service:latest"
echo "${ACR_URL}/frontend-user:latest"
echo "${ACR_URL}/frontend-admin:latest"
echo "${ACR_URL}/frontend-auth:latest"
if [ "$PUSH_DB" = true ]; then
    echo "${ACR_URL}/postgres:15"
    echo "${ACR_URL}/mongo:7"
fi
echo ""
echo "Next step: Deploy to Azure Container Apps or App Service"
