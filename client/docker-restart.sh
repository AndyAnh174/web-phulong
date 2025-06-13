#!/bin/bash

echo "🔄 Restarting Backend Docker..."
cd /home/andyanh/web-in-an/sever
docker compose down
docker compose up -d --build

echo "🔄 Restarting Frontend Docker..."
cd /home/andyanh/web-in-an/client
docker compose down
docker compose up -d --build

echo "✅ Both services restarted!"
echo "🌐 Frontend: https://demo.andyanh.id.vn"
echo "🔧 Backend: https://demoapi.andyanh.id.vn" 