#!/bin/bash

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install Node.js dependencies
npm install

echo "Setup complete! Activate the virtual environment with: source venv/bin/activate"