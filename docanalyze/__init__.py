"""
DocAnalyze - A document analysis application using Google Gemini API.
"""
import os
import logging
from datetime import datetime
from flask import Flask
from flask_login import LoginManager
from authlib.integrations.flask_client import OAuth

from docanalyze.config.settings import config
from docanalyze.models import db, User

# Create oauth object
oauth = OAuth()

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
    
    # Initialize SQLAlchemy
    db.init_app(app)
    with app.app_context():
        db.create_all()
    
    # Initialize login manager
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Initialize OAuth
    oauth.init_app(app)
    register_oauth_providers(app)
    
    # Add template context processors
    @app.context_processor
    def inject_current_year():
        return {'current_year': datetime.now().year}
    
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
    from docanalyze.web.routes import web_bp
    from docanalyze.auth.routes import auth_bp
    
    # Register blueprints
    app.register_blueprint(api_bp)
    app.register_blueprint(web_bp)
    app.register_blueprint(auth_bp)

def register_oauth_providers(app):
    """Register OAuth providers."""
    # Google OAuth
    if app.config.get('GOOGLE_CLIENT_ID') and app.config.get('GOOGLE_CLIENT_SECRET'):
        app.logger.debug(f"Registering Google OAuth with client_id: {app.config['GOOGLE_CLIENT_ID'][:8]}...")
        oauth.register(
            name='google',
            client_id=app.config['GOOGLE_CLIENT_ID'],
            client_secret=app.config['GOOGLE_CLIENT_SECRET'],
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={'scope': 'openid email profile'}
        )
        app.logger.debug("Google OAuth registration successful")
    else:
        app.logger.warning("Google OAuth credentials not found in configuration")
    
    # Apple OAuth - commented out for now
    '''
    if all(app.config.get(k) for k in ['APPLE_CLIENT_ID', 'APPLE_TEAM_ID', 'APPLE_KEY_ID']):
        oauth.register(  # nosec B106
            name='apple',
            client_id=app.config['APPLE_CLIENT_ID'],
            client_secret={
                'kid': app.config['APPLE_KEY_ID'],
                'team_id': app.config['APPLE_TEAM_ID'],
                'private_key': app.config['APPLE_PRIVATE_KEY'],
            },
            authorize_url='https://appleid.apple.com/auth/authorize',  # nosec B106
            access_token_url='https://appleid.apple.com/auth/token',  # nosec B106
            userinfo_endpoint=None,  # Apple doesn't have a userinfo endpoint
            client_kwargs={'scope': 'name email'},
        )
    '''