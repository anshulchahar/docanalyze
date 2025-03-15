"""
DocAnalyze - A document analysis application using Google Gemini API.
"""
import os
import logging
from flask import Flask

from docanalyze.config.settings import config

def create_app(config_name='default'):
    """
    Create and configure the Flask application using the factory pattern.
    
    Args:
        config_name: Configuration environment to use
        
    Returns:
        Flask application instance
    """
    # Create Flask app
    app = Flask(__name__, 
                static_folder='../static', 
                template_folder='../templates')
    
    # Load configuration
    app.config.from_object(config[config_name])
    config[config_name].init_app()
    
    # Configure logging
    configure_logging(app)
    
    # Register blueprints
    register_blueprints(app)
    
    return app

def configure_logging(app):
    """Configure application logging."""
    log_level = app.config.get('LOG_LEVEL', 'DEBUG')
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

def register_blueprints(app):
    """Register Flask blueprints."""
    # Import blueprints
    from docanalyze.api.routes import api_bp
    
    # Web views blueprint (if separate from API)
    from docanalyze.web import routes as web_routes
    
    # Register blueprints
    app.register_blueprint(api_bp)
    app.register_blueprint(web_routes.web_bp)