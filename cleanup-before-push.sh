#!/bin/bash

echo "🧹 Cleaning up debug scripts before GitHub push..."

# Remove debug/fix scripts
rm -f fix-mobile-scroll.sh
rm -f fix-mobile-scroll-complete.sh
rm -f fix-mobile-scroll-ultimate.sh
rm -f fix-modal-scroll.sh
rm -f fix-frontend-vm.sh
rm -f fix-scroll-targeted.sh
rm -f debug-connection.sh
rm -f build-and-push.sh

echo "✅ Cleanup complete!"
echo ""
echo "Removed scripts:"
echo "  - fix-*.sh (mobile scroll debugging)"
echo "  - debug-*.sh (connection debugging)"
echo "  - build-and-push.sh (test script)"
echo ""
echo "Next: Run ./github-setup.sh to push to GitHub"
