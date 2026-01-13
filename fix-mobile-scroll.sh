#!/bin/bash

# Fix Mobile Scroll Issue - Auto Script
# Fixes scrolling problem on mobile devices for room booking page

echo "🔧 Fixing Mobile Scroll Issue..."
echo ""

cd ~/UASfix || exit 1

# Backup original file
cp services/frontend-user/src/Home.jsx services/frontend-user/src/Home.jsx.backup
echo "✅ Backup created: Home.jsx.backup"

# Apply fix using sed
sed -i '374s|<div className="min-h-screen pb-20">|<div className="min-h-screen pb-20 overflow-y-auto" style={{ WebkitOverflowScrolling: '\''touch'\'' }}>|' services/frontend-user/src/Home.jsx

# Verify change
if grep -q 'overflow-y-auto' services/frontend-user/src/Home.jsx; then
    echo "✅ File updated successfully!"
else
    echo "❌ Update failed! Restoring backup..."
    mv services/frontend-user/src/Home.jsx.backup services/frontend-user/src/Home.jsx
    exit 1
fi

echo ""
echo "🏗️  Rebuilding frontend-user..."
docker-compose down
docker-compose build frontend-user
docker-compose up -d

echo ""
echo "⏳ Waiting for services..."
sleep 10

echo ""
echo "✅ Done! Changes applied:"
echo "   - Added overflow-y-auto for scrolling"
echo "   - Added WebkitOverflowScrolling for smooth iOS scroll"
echo ""
echo "📱 Test di HP sekarang! Scroll harus jalan smooth!"
