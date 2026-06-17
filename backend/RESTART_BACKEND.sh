#!/bin/bash

echo "🔄 Restarting Backend with Migration..."

cd /Users/alperen/ZeKids/backend/ZeKids.API

# Stop any running dotnet process
pkill -f "dotnet.*ZeKids.API"

# Apply migrations
echo "📊 Applying database migrations..."
dotnet ef database update --no-build

# Start backend
echo "🚀 Starting backend..."
dotnet run
