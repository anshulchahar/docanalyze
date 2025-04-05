#!/bin/bash

# Kill all existing node processes (Optional - only if needed)
# pkill -f node

# Clear .next cache
rm -rf .next

# Run the development server
npm run dev 