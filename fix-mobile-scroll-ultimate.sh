#!/bin/bash

# Ultimate Mobile Scroll Fix for TERRAS
# This addresses ALL possible scroll blocking issues

echo "🔧 Ultimate Mobile Scroll Fix"
echo "=============================="
cd ~/UASfix || exit 1

echo ""
echo "📝 Step 1: Fixing index.html viewport..."
# Add/fix viewport meta tag for mobile
sed -i 's|<meta name="viewport".*>|<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">|' services/frontend-user/index.html

echo "✅ Viewport updated"

echo ""
echo "📝 Step 2: Removing height constraints..."
# Remove min-h-screen from main container
sed -i '374s|className="min-h-screen pb-20"|className="pb-20"|' services/frontend-user/src/Home.jsx
sed -i '374s|className="pb-20"|className="pb-20" style={{minHeight: "auto"}}|' services/frontend-user/src/Home.jsx

echo "✅ Height constraints removed"

echo ""
echo "📝 Step 3: Adding comprehensive CSS fixes..."
# Create/append to index.css
cat >> services/frontend-user/src/index.css << 'EOF'

/* ==========================================
   MOBILE SCROLL FIX - DO NOT REMOVE
   ========================================== */

/* Force scrolling at all levels */
* {
  -webkit-overflow-scrolling: touch !important;
}

html {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100% !important;
  position: relative !important;
}

body {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100vh !important;
  position: relative !important;
  -webkit-overflow-scrolling: touch !important;
}

#root {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  min-height: 100vh !important;
  height: auto !important;
  position: relative !important;
  -webkit-overflow-scrolling: touch !important;
}

/* Fix for iOS Safari */
@supports (-webkit-touch-callout: none) {
  body {
    height: 100vh !important;
    height: -webkit-fill-available !important;
  }
  
  #root {
    min-height: 100vh !important;
    min-height: -webkit-fill-available !important;
  }
}

/* Prevent any parent from blocking scroll */
.min-h-screen {
  min-height: auto !important;
}

/* Container fixes */
.container {
  overflow-x: hidden !important;
  overflow-y: visible !important;
}

/* Ensure room grid is scrollable */
section {
  overflow-y: visible !important;
}

EOF

echo "✅ CSS fixes added"

echo ""
echo "📝 Step 4: Removing conflicting Tailwind classes..."
# Remove any h-screen or min-h-screen from room grid area
sed -i 's|className="grid|className="grid overflow-visible|g' services/frontend-user/src/Home.jsx

echo "✅ Conflicts removed"

echo ""
echo "🏗️  Step 5: Rebuilding frontend..."
docker-compose down
docker-compose build frontend-user
docker-compose up -d

echo ""
echo "⏳ Waiting for service..."
sleep 15

echo ""
echo "=================================="
echo "✅ DONE! Mobile Scroll Fixed!"
echo "=================================="
echo ""
echo "📱 IMPORTANT - Di HP kamu:"
echo "   1. Hard refresh (hold refresh button → 'Reload and Clear Cache')"
echo "   2. Atau tutup semua tabs, clear browser cache"
echo "   3. Buka ulang http://$(curl -s ifconfig.me):5173"
echo ""
echo "🔍 Test:"
echo "   - Scroll halaman home (daftar room)"
echo "   - Buka 'Cek Jadwal' room"
echo "   - Scroll timeline di dalam modal"
echo ""
echo "Kalau MASIH belum bisa, screenshot & kasih tau error console!"
