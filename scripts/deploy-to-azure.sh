#!/bin/bash

# TERRAS Deploy to Azure Container Apps
# Script untuk deploy semua services ke Azure

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Deploy TERRAS to Azure Container Apps"
echo "========================================="
echo ""

# Load credentials
if [ ! -f ".azure-credentials" ]; then
    echo -e "${RED}Error: .azure-credentials file not found${NC}"
    echo "Please run ./scripts/setup-azure.sh first"
    exit 1
fi

source .azure-credentials

echo "Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  ACR Name:       $ACR_NAME"
echo "  ACR URL:        $ACR_URL"
echo ""

# Step 1: Deploy Databases
echo -e "${YELLOW}[1/4] Deploying databases...${NC}"

# PostgreSQL
echo "Deploying PostgreSQL..."
az containerapp create \
    --name postgres \
    --resource-group $RESOURCE_GROUP \
    --environment terras-env \
    --image ${ACR_URL}/postgres:15 \
    --registry-server $ACR_URL \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 5432 \
    --ingress internal \
    --env-vars \
        POSTGRES_USER=postgres \
        POSTGRES_PASSWORD=postgres \
        POSTGRES_DB=terras_auth \
    --cpu 0.5 \
    --memory 1.0Gi \
    --min-replicas 1 \
    --max-replicas 1 \
    2>/dev/null || echo "PostgreSQL already exists, skipping..."

echo -e "${GREEN}✓ PostgreSQL deployed${NC}"

# MongoDB
echo "Deploying MongoDB..."
az containerapp create \
    --name mongo \
    --resource-group $RESOURCE_GROUP \
    --environment terras-env \
    --image ${ACR_URL}/mongo:7 \
    --registry-server $ACR_URL \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 27017 \
    --ingress internal \
    --cpu 0.5 \
    --memory 1.0Gi \
    --min-replicas 1 \
    --max-replicas 1 \
    2>/dev/null || echo "MongoDB already exists, skipping..."

echo -e "${GREEN}✓ MongoDB deployed${NC}"
echo ""

# Wait for databases to be ready
echo "Waiting for databases to initialize..."
sleep 30

# Step 2: Deploy Backend Services
echo -e "${YELLOW}[2/4] Deploying backend services...${NC}"

# Auth Service
echo "Deploying Auth Service..."
az containerapp create \
    --name auth-service \
    --resource-group $RESOURCE_GROUP \
    --environment terras-env \
    --image ${ACR_URL}/auth-service:latest \
    --registry-server $ACR_URL \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 3001 \
    --ingress external \
    --env-vars \
        PORT=3001 \
        DB_NAME=terras_auth \
        DB_USER=postgres \
        DB_PASS=postgres \
        DB_HOST=postgres \
        JWT_SECRET=supersecretkey_change_in_production \
    --cpu 0.5 \
    --memory 1.0Gi \
    --min-replicas 1 \
    --max-replicas 3 \
    2>/dev/null || echo "Auth Service already exists, updating..."

echo -e "${GREEN}✓ Auth Service deployed${NC}"

# Room Service
echo "Deploying Room Service..."
az containerapp create \
    --name room-service \
    --resource-group $RESOURCE_GROUP \
    --environment terras-env \
    --image ${ACR_URL}/room-service:latest \
    --registry-server $ACR_URL \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 3002 \
    --ingress external \
    --env-vars \
        PORT=3002 \
        MONGODB_URI=mongodb://mongo:27017/terras_rooms \
    --cpu 0.5 \
    --memory 1.0Gi \
    --min-replicas 1 \
    --max-replicas 3 \
    2>/dev/null || echo "Room Service already exists, updating..."

echo -e "${GREEN}✓ Room Service deployed${NC}"

# Booking Service
echo "Deploying Booking Service..."
az containerapp create \
    --name booking-service \
    --resource-group $RESOURCE_GROUP \
    --environment terras-env \
    --image ${ACR_URL}/booking-service:latest \
    --registry-server $ACR_URL \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 3003 \
    --ingress external \
    --env-vars \
        PORT=3003 \
        MONGODB_URI=mongodb://mongo:27017/terras_bookings \
    --cpu 0.5 \
    --memory 1.0Gi \
    --min-replicas 1 \
    --max-replicas 3 \
    2>/dev/null || echo "Booking Service already exists, updating..."

echo -e "${GREEN}✓ Booking Service deployed${NC}"
echo ""

# Step 3: Get Backend URLs
echo -e "${YELLOW}[3/4] Getting backend URLs...${NC}"

AUTH_URL=$(az containerapp show --name auth-service --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
ROOM_URL=$(az containerapp show --name room-service --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
BOOKING_URL=$(az containerapp show --name booking-service --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)

echo "Backend URLs:"
echo "  Auth:    https://$AUTH_URL"
echo "  Room:    https://$ROOM_URL"
echo "  Booking: https://$BOOKING_URL"
echo ""

# Step 4: Deploy Frontend Services
echo -e "${YELLOW}[4/4] Deploying frontend services...${NC}"
echo -e "${YELLOW}⚠ Note: Frontend services need to be rebuilt with production URLs${NC}"
echo ""

# User Frontend
echo "Deploying User Frontend..."
az containerapp create \
    --name frontend-user \
    --resource-group $RESOURCE_GROUP \
    --environment terras-env \
    --image ${ACR_URL}/frontend-user:latest \
    --registry-server $ACR_URL \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 80 \
    --ingress external \
    --cpu 0.25 \
    --memory 0.5Gi \
    --min-replicas 1 \
    --max-replicas 2 \
    2>/dev/null || echo "User Frontend already exists, updating..."

echo -e "${GREEN}✓ User Frontend deployed${NC}"

# Admin Frontend
echo "Deploying Admin Frontend..."
az containerapp create \
    --name frontend-admin \
    --resource-group $RESOURCE_GROUP \
    --environment terras-env \
    --image ${ACR_URL}/frontend-admin:latest \
    --registry-server $ACR_URL \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 80 \
    --ingress external \
    --cpu 0.25 \
    --memory 0.5Gi \
    --min-replicas 1 \
    --max-replicas 2 \
    2>/dev/null || echo "Admin Frontend already exists, updating..."

echo -e "${GREEN}✓ Admin Frontend deployed${NC}"

# Auth Frontend
echo "Deploying Auth Frontend..."
az containerapp create \
    --name frontend-auth \
    --resource-group $RESOURCE_GROUP \
    --environment terras-env \
    --image ${ACR_URL}/frontend-auth:latest \
    --registry-server $ACR_URL \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 80 \
    --ingress external \
    --cpu 0.25 \
    --memory 0.5Gi \
    --min-replicas 1 \
    --max-replicas 2 \
    2>/dev/null || echo "Auth Frontend already exists, updating..."

echo -e "${GREEN}✓ Auth Frontend deployed${NC}"
echo ""

# Get Frontend URLs
USER_URL=$(az containerapp show --name frontend-user --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
ADMIN_URL=$(az containerapp show --name frontend-admin --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
AUTH_FRONTEND_URL=$(az containerapp show --name frontend-auth --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)

# Summary
echo "========================================="
echo -e "${GREEN}Deployment Complete! 🎉${NC}"
echo "========================================="
echo ""
echo "Application URLs:"
echo "  User App:   https://$USER_URL"
echo "  Admin App:  https://$ADMIN_URL"
echo "  Auth App:   https://$AUTH_FRONTEND_URL"
echo ""
echo "Backend APIs:"
echo "  Auth:       https://$AUTH_URL"
echo "  Room:       https://$ROOM_URL"
echo "  Booking:    https://$BOOKING_URL"
echo ""
echo -e "${YELLOW}⚠ Important Next Steps:${NC}"
echo "1. Update frontend .env files with these URLs"
echo "2. Rebuild frontend images with production URLs"
echo "3. Push updated frontend images to ACR"
echo "4. Update Container Apps with new images"
echo ""
echo "To update a service:"
echo "  az containerapp update \\"
echo "    --name <service-name> \\"
echo "    --resource-group $RESOURCE_GROUP \\"
echo "    --image ${ACR_URL}/<service-name>:latest"
echo ""

# Save URLs to file
cat > .azure-urls << EOF
# TERRAS Azure URLs
# Generated: $(date)

# Frontend URLs
USER_APP_URL=https://$USER_URL
ADMIN_APP_URL=https://$ADMIN_URL
AUTH_APP_URL=https://$AUTH_FRONTEND_URL

# Backend URLs
AUTH_SERVICE_URL=https://$AUTH_URL
ROOM_SERVICE_URL=https://$ROOM_URL
BOOKING_SERVICE_URL=https://$BOOKING_URL

# For frontend .env files:
VITE_API_URL=https://$AUTH_URL
VITE_ROOM_SERVICE=https://$ROOM_URL
VITE_BOOKING_SERVICE=https://$BOOKING_URL
VITE_AUTH_APP_URL=https://$AUTH_FRONTEND_URL
VITE_USER_APP_URL=https://$USER_URL
VITE_ADMIN_APP_URL=https://$ADMIN_URL
EOF

echo -e "${GREEN}✓ URLs saved to .azure-urls${NC}"
