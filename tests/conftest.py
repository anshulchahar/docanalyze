"""
Test configuration file for pytest.
"""
import os
import sys
import pytest

# Add the project root directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import our app factory to create an app instance for testing
from docanalyze import create_app
from docanalyze.config.settings import config

@pytest.fixture
def app():
    """Create an application for testing."""
    app = create_app('testing')
    return app

@pytest.fixture
def client(app):
    """Create a test client for the Flask app."""
    with app.test_client() as client:
        yield client

# Additional fixtures can be added here for commonly used test resources
@pytest.fixture
def sample_pdf_data():
    """Return sample PDF data for testing."""
    return b"%PDF-1.4\nThis is sample text for testing purposes."