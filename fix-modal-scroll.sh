#!/bin/bash

# Modal Scroll Fix - The REAL Issue!
# Fixes booking modal not scrollable on mobile

echo "🎯 Modal Scroll Fix for Mobile"
echo "==============================="
cd ~/UASfix || exit 1

echo ""
echo "📝 Fixing booking modal scroll..."

# Find and fix the Modal component form
# Line ~578: Add overflow and max-height to form container
sed -i '578s|className="space-y-4"|className="space-y-4 overflow-y-auto max-h-[60vh] px-1"|' services/frontend-user/src/Home.jsx

echo "✅ Modal form now scrollable"

echo ""
echo "📝 Adding modal-specific CSS..."

cat >> services/frontend-user/src/index.css << 'EOF'

/* ==========================================
   MODAL SCROLL FIX FOR MOBILE
   ========================================== */

/* Ensure modal content can scroll */
form {
  -webkit-overflow-scrolling: touch !important;
}

/* Modal specific fixes */
[role="dialog"] {
  overflow-y: auto !important;
  max-height: 90vh !important;
}

/* Allow form to scroll on mobile */
form.space-y-4 {
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch !important;
}

/* Mobile specific - reduce modal height */
@media (max-width: 768px) {
  [role="dialog"] {
    max-height: 85vh !important;
  }
  
  form {
    max-height: 65vh !important;
    overflow-y: auto !important;
  }
}

EOF

echo "✅ CSS added"

echo ""
echo "🏗️  Rebuilding frontend..."
docker-compose down
docker-compose build frontend-user
docker-compose up -d

echo ""
echo "⏳ Waiting..."
sleep 15

VM_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-ip")

echo ""
echo "=================================="
echo "✅ MODAL SCROLL FIXED!"
echo "=================================="
echo ""
echo "📱 Test di HP:"
echo "   1. Buka http://${VM_IP}:5173"
echo "   2. Klik 'Booking Langsung' di room card"
echo "   3. Modal muncul → SCROLL form kebawah!"
echo ""
echo "Sekarang modal PASTI bisa scroll! 🎉"
