#!/bin/bash

echo "🧹 Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🔄 Rebuilding frontend..."
npm run build

echo "✅ Frontend rebuild completed!"
echo "🚀 You can now restart your frontend with: npm run start" 