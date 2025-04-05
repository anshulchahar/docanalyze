#!/bin/bash

echo "Stopping running Node.js processes..."
# Uncomment if needed:
# pkill -f node

echo "Clearing browser sessions (tip for user)"
echo "Please also clear your browser cookies and cache for localhost"

echo "Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "Checking current port..."
PORT=$(lsof -i -P | grep LISTEN | grep node | awk '{print $9}' | grep -o '[0-9]*$' | head -n 1)
if [ -n "$PORT" ]; then
  echo "Found Next.js running on port: $PORT"
  echo "Updating NEXTAUTH_URL to use port $PORT"
  sed -i '' "s|NEXTAUTH_URL=\"http://localhost:[0-9]*\"|NEXTAUTH_URL=\"http://localhost:$PORT\"|g" .env
fi

echo "Starting development server..."
npm run dev 