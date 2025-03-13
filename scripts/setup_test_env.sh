#!/bin/bash

# Ensure we're in a virtual environment
if [[ "$VIRTUAL_ENV" == "" ]]; then
  echo "Activating virtual environment..."
  source venv/bin/activate || { echo "Please create a virtual environment first with 'python -m venv venv'"; exit 1; }
fi

# Install test dependencies
pip install pytest pytest-cov pytest-mock

# Set up test directory structure
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/fixtures

# Create pytest configuration
cat > pytest.ini << EOL
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = --verbose --cov=. --cov-report=term-missing
EOL

echo "Test environment setup complete!"