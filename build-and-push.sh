#!/bin/bash

# Script untuk build dan push semua images ke Docker Hub
# Username: gunawanrafi9

set -e  # Exit on error

DOCKER_USER="gunawanrafi9"

echo "🔵 Starting build and push process for user: $DOCKER_USER"
echo ""

# Step 1: Login ke Docker Hub
echo "📝 Step 1: Login to Docker Hub"
echo "Please enter your Docker Hub password when prompted:"
docker login -u $DOCKER_USER

echo ""
echo "🏗️  Step 2: Building all images..."
echo ""

# Build semua services menggunakan docker compose
docker compose build --no-cache

echo ""
echo "🏷️  Step 3: Tagging images for Docker Hub..."
echo ""

# Tag backend services
docker tag uasfix-auth-service:latest $DOCKER_USER/terras-auth:latest
echo "✅ Tagged: $DOCKER_USER/terras-auth:latest"

docker tag uasfix-room-service:latest $DOCKER_USER/terras-room:latest
echo "✅ Tagged: $DOCKER_USER/terras-room:latest"

docker tag uasfix-booking-service:latest $DOCKER_USER/terras-booking:latest
echo "✅ Tagged: $DOCKER_USER/terras-booking:latest"

# Tag frontend services
docker tag uasfix-frontend-user:latest $DOCKER_USER/terras-frontend-user:latest
echo "✅ Tagged: $DOCKER_USER/terras-frontend-user:latest"

docker tag uasfix-frontend-admin:latest $DOCKER_USER/terras-frontend-admin:latest
echo "✅ Tagged: $DOCKER_USER/terras-frontend-admin:latest"

docker tag uasfix-frontend-auth:latest $DOCKER_USER/terras-frontend-auth:latest
echo "✅ Tagged: $DOCKER_USER/terras-frontend-auth:latest"

echo ""
echo "📤 Step 4: Pushing images to Docker Hub..."
echo ""

# Push backend services
echo "Pushing auth service..."
docker push $DOCKER_USER/terras-auth:latest
echo "✅ Pushed: $DOCKER_USER/terras-auth:latest"
echo ""

echo "Pushing room service..."
docker push $DOCKER_USER/terras-room:latest
echo "✅ Pushed: $DOCKER_USER/terras-room:latest"
echo ""

echo "Pushing booking service..."
docker push $DOCKER_USER/terras-booking:latest
echo "✅ Pushed: $DOCKER_USER/terras-booking:latest"
echo ""

# Push frontend services
echo "Pushing frontend-user..."
docker push $DOCKER_USER/terras-frontend-user:latest
echo "✅ Pushed: $DOCKER_USER/terras-frontend-user:latest"
echo ""

echo "Pushing frontend-admin..."
docker push $DOCKER_USER/terras-frontend-admin:latest
echo "✅ Pushed: $DOCKER_USER/terras-frontend-admin:latest"
echo ""

echo "Pushing frontend-auth..."
docker push $DOCKER_USER/terras-frontend-auth:latest
echo "✅ Pushed: $DOCKER_USER/terras-frontend-auth:latest"
echo ""

echo "✨ All done! ✨"
echo ""
echo "📋 Images pushed to Docker Hub:"
echo "   - $DOCKER_USER/terras-auth:latest"
echo "   - $DOCKER_USER/terras-room:latest"
echo "   - $DOCKER_USER/terras-booking:latest"
echo "   - $DOCKER_USER/terras-frontend-user:latest"
echo "   - $DOCKER_USER/terras-frontend-admin:latest"
echo "   - $DOCKER_USER/terras-frontend-auth:latest"
echo ""
echo "🎯 Your friends can now pull these images with:"
echo "   docker pull $DOCKER_USER/terras-auth:latest"
echo "   docker pull $DOCKER_USER/terras-room:latest"
echo "   ... etc"
