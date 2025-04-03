"""
Web routes for the DocAnalyze application.
"""
from flask import Blueprint, render_template, current_app, abort, redirect, url_for
import logging
from flask_login import login_required, current_user
from docanalyze.models import DocumentAnalysis

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

# Add new route for history
@web_bp.route('/history', methods=['GET'])
@login_required
def history():
    """Show user's document analysis history."""
    analyses = DocumentAnalysis.query.filter_by(user_id=current_user.id).order_by(
        DocumentAnalysis.created_at.desc()).all()
    return render_template('history.html', analyses=analyses)

@web_bp.route('/history/<int:analysis_id>', methods=['GET'])
@login_required
def view_analysis(analysis_id):
    """View a specific analysis."""
    analysis = DocumentAnalysis.query.get_or_404(analysis_id)
    if analysis.user_id != current_user.id:
        abort(403)  # Forbidden
    return render_template('analysis.html', analysis=analysis)

# Routes for React auth components
@web_bp.route('/login', methods=['GET'])
def login():
    """Serve the React login component."""
    return render_template('base.html', title="Login", page_name="login")

@web_bp.route('/register', methods=['GET'])
def register():
    """Serve the React register component."""
    return render_template('base.html', title="Register", page_name="register")

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