#!/bin/bash

# GitHub Setup Script for TERRAS Project
# This script prepares and pushes your project to GitHub

echo "🚀 TERRAS GitHub Setup"
echo "====================="
echo ""

# Step 1: Initialize Git (if not already)
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Step 2: Add .gitignore
echo ""
echo "🔒 Checking .gitignore..."
if [ -f ".gitignore" ]; then
    echo "✅ .gitignore exists"
else
    echo "⚠️  Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Environment Variables
.env
.env.local
.env.production
*.env
!*.env.example

# Dependencies
node_modules/
**/node_modules/

# Build outputs
dist/
build/
**/dist/
**/build/

# Logs
*.log
npm-debug.log*

# Docker
*.sqlite  
*.db

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Temporary
tmp/
temp/
*.tmp
*.backup
EOF
    echo "✅ .gitignore created"
fi

# Step 3: Check for sensitive data
echo ""
echo "🔍 Checking for sensitive data..."
SENSITIVE_FILES=$(find . -name ".env" -not -name ".env.example" 2>/dev/null)
if [ ! -z "$SENSITIVE_FILES" ]; then
    echo "⚠️  WARNING: Found .env files (these will be ignored by .gitignore):"
    echo "$SENSITIVE_FILES"
else
    echo "✅ No sensitive .env files found"
fi

# Step 4: Stage files
echo ""
echo "📁 Staging files..."
git add .
echo "✅ Files staged"

# Step 5: Show status
echo ""
echo "📊 Git Status:"
git status --short

# Step 6: Initial commit
echo ""
read -p "Create initial commit? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "Initial commit: TERRAS Room Booking System

- Microservices architecture with Docker
- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Databases: PostgreSQL + MongoDB
- Features: Room booking, admin dashboard, JWT auth
- Deployment: Azure VM ready with reverse proxy support"
    
    echo "✅ Initial commit created"
fi

# Step 7: GitHub remote setup
echo ""
echo "🌐 GitHub Repository Setup"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "   Repository name: terras-room-booking (or your choice)"
echo "   Description: Room Booking System for Telkom University"
echo "   Visibility: Public or Private"
echo "   DON'T initialize with README (we already have one)"
echo ""
echo "2. After creating the repo, run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/terras-room-booking.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""

read -p "Have you created the GitHub repository? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter your GitHub username: " GITHUB_USER
    read -p "Enter your repository name [terras-room-booking]: " GITHUB_REPO
    GITHUB_REPO=${GITHUB_REPO:-terras-room-booking}
    
    echo ""
    echo "Setting up remote..."
    git remote add origin "https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git" 2>/dev/null || \
        git remote set-url origin "https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git"
    
    git branch -M main
    
    echo ""
    echo "🚀 Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SUCCESS! Project pushed to GitHub!"
        echo ""
        echo "🌐 View your repository at:"
        echo "   https://github.com/${GITHUB_USER}/${GITHUB_REPO}"
    else
        echo ""
        echo "❌ Push failed. Please check:"
        echo "   - GitHub repository exists"
        echo "   - You have push permissions"
        echo "   - Git credentials are configured"
        echo ""
        echo "Try running manually:"
        echo "   git push -u origin main"
    fi
else
    echo ""
    echo "💡 When ready, create your GitHub repo and run:"
    echo "   ./github-setup.sh"
fi

echo ""
echo "📚 Don't forget to update README.md with:"
echo "   - Your GitHub username"
echo "   - Your email"
echo "   - Add screenshots/demo links"
echo ""
echo "Done! 🎉"
