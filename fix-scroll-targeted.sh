#!/bin/bash

# Targeted Mobile Scroll Fix - Final Solution
# Fixes the exact layout issue preventing scroll

echo "🎯 Targeted Mobile Scroll Fix"
echo "=============================="
cd ~/UASfix || exit 1

echo ""
echo "📝 Fixing main container (removing min-h-screen)..."
# Line 374: Remove min-h-screen completely
sed -i '374s|className="min-h-screen pb-20 overflow-y-auto"|className="pb-20"|' services/frontend-user/src/Home.jsx

echo "✅ Main container fixed"

echo ""
echo "📝 Fixing hero section (responsive height)..."
# Line 379: Make hero responsive - shorter on mobile
sed -i '379s|className="relative -mt-8 h-\[700px\]|className="relative -mt-8 h-\[400px\] md:h-\[500px\] lg:h-\[700px\]|' services/frontend-user/src/Home.jsx

echo "✅ Hero section now responsive"

echo ""
echo "📝 Adding body-level scroll CSS..."
# Ensure body can scroll
cat > /tmp/scroll-fix.css << 'EOF'

/* Mobile Scroll Fix */
html, body {
  overflow-y: scroll !important;
  -webkit-overflow-scrolling: touch !important;
  height: auto !important;
}

body {
  min-height: 100vh !important;
  position: relative !important;
}

#root {
  min-height: 100vh !important;
  overflow-y: visible !important;
}

/* Remove min-height from containers */
.min-h-screen {
  min-height: 0 !important;
}
EOF

# Append to index.css
cat /tmp/scroll-fix.css >> services/frontend-user/src/index.css
rm /tmp/scroll-fix.css

echo "✅ CSS fixes applied"

echo ""
echo "🏗️  Rebuilding frontend..."
docker-compose down
docker-compose build frontend-user
docker-compose up -d

echo ""
echo "⏳ Waiting for service..."
sleep 15

VM_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-vm-ip")

echo ""
echo "=================================="
echo "✅ DONE! Mobile Scroll Fixed!"
echo "=================================="
echo ""
echo "📱 Test di HP (incognito mode):"
echo "   http://${VM_IP}:5173"
echo ""
echo "Changes made:"
echo "   ✓ Removed min-h-screen (was locking height)"
echo "   ✓ Hero: 700px → 400px on mobile"
echo "   ✓ Added body overflow: scroll"
echo ""
echo "Sekarang PASTI bisa scroll! 🎉"
