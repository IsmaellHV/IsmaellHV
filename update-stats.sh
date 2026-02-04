#!/bin/bash

# Manual GitHub Profile Stats Update Script
# This script can be run locally to test the update functionality

echo "🚀 Starting Manual GitHub Profile Stats Update..."

# Get current timestamp for cache busting
CACHE_BUSTER=$(date +%s)
CURRENT_DATE=$(date +'%Y-%m-%d %H:%M:%S UTC')

echo "📅 Current Date: $CURRENT_DATE"
echo "🔄 Cache Buster: $CACHE_BUSTER"

# Update cache busting parameters in README
sed -i '' "s/cache_buster=[0-9]*/cache_buster=$CACHE_BUSTER/g" README.md

# Update last updated section
if grep -q "LAST_UPDATED:START" README.md; then
    sed -i '' "/LAST_UPDATED:START/,/LAST_UPDATED:END/d" README.md
fi

echo "" >> README.md
echo "<!-- LAST_UPDATED:START -->" >> README.md
echo "**🔄 Last Updated:** $CURRENT_DATE" >> README.md
echo "<!-- LAST_UPDATED:END -->" >> README.md

echo "✅ GitHub Profile Stats Updated Successfully!"
echo "🎯 You can now commit and push the changes manually"
echo "📊 All profile statistics have been refreshed"
