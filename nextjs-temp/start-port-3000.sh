#!/bin/bash

echo "Stopping any processes using port 3000..."
# Try to kill any process using port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes were running on port 3000"

echo "Starting Next.js application on port 3000 only..."
cd "$(dirname "$0")"
npm run dev
