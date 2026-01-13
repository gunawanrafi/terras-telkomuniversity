#!/bin/bash

# Complete Mobile Scroll Fix - Comprehensive Solution
# This script applies all necessary fixes for mobile scrolling

echo "🔧 Complete Mobile Scroll Fix for TERRAS"
echo "========================================"
echo ""

cd ~/UASfix || exit 1

echo "📝 Creating comprehensive scroll fix..."
echo ""

# Fix 1: Update Home.jsx main container
echo "1️⃣  Fixing Home.jsx main container..."
cp services/frontend-user/src/Home.jsx services/frontend-user/src/Home.jsx.backup
sed -i '374s|<div className="min-h-screen pb-20">|<div className="pb-20">|' services/frontend-user/src/Home.jsx

# Fix 2: Check if there's a global CSS file and add mobile fixes
if [ -f "services/frontend-user/src/index.css" ]; then
    echo "2️⃣  Adding mobile scroll fixes to index.css..."
    cat >> services/frontend-user/src/index.css << 'EOF'

/* Mobile Scroll Fix */
html, body {
  overflow-x: hidden;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
  height: auto;
  min-height: 100%;
}

#root {
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 100vh;
}

/* Ensure smooth scrolling on iOS */
* {
  -webkit-overflow-scrolling: touch;
}
EOF
else
    echo "2️⃣  Creating index.css with mobile fixes..."
    cat > services/frontend-user/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Mobile Scroll Fix */
html, body {
  overflow-x: hidden;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
  height: auto;
  min-height: 100%;
}

#root {
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 100vh;
}

/* Ensure smooth scrolling on iOS */
* {
  -webkit-overflow-scrolling: touch;
}
EOF
fi

echo "✅ Fixes applied!"
echo ""
echo "🏗️  Rebuilding frontend-user..."
docker-compose down
docker-compose build frontend-user
docker-compose up -d

echo ""
echo "⏳ Waiting for services..."
sleep 15

echo ""
echo "✅ Done! Applied fixes:"
echo "   ✓ Removed min-h-screen constraint"
echo "   ✓ Added global CSS for mobile scroll"
echo "   ✓ Enabled touch scrolling for iOS"
echo ""
echo "📱 Test di HP sekarang!"
echo ""
echo "🔍 Kalau masih gabisa, coba:"
echo "   1. Hard refresh di HP (Ctrl+Shift+R)"
echo "   2. Clear browser cache"
echo "   3. Test di browser lain"
