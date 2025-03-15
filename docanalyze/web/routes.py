"""
Web routes for the DocAnalyze application.
"""
from flask import Blueprint, render_template, current_app
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint
web_bp = Blueprint('web', __name__)

@web_bp.route('/', methods=['GET'])
def index():
    """Render the main application page."""
    return render_template('index.html')

@web_bp.route('/about', methods=['GET'])
def about():
    """Render the about page."""
    return render_template('about.html')

# Error handlers
@web_bp.app_errorhandler(404)
def page_not_found(e):
    """Handle 404 errors."""
    return render_template('errors/404.html'), 404

@web_bp.app_errorhandler(500)
def server_error(e):
    """Handle 500 errors."""
    logger.error(f"Server error: {str(e)}")
    return render_template('errors/500.html'), 500