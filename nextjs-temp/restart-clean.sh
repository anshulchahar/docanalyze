#!/bin/bash

# Stop any existing processes (optional)
# pkill -f node

# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Clean reinstall (optional - only if needed)
# rm -rf node_modules
# npm install

# Run the development server
npm run dev 