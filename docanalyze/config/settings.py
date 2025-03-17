"""
Configuration settings for the DocAnalyze application.
"""
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Config:
    """Base configuration class for DocAnalyze application."""
    # Flask settings
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-for-docanalyze')
    
    # Application settings
    APP_NAME = "DocAnalyze"
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max upload size
    
    # API settings
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GEMINI_MODEL = "gemini-1.5-pro"
    
    # Database settings
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f"sqlite:///{os.path.join(os.getcwd(), 'docanalyze.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # OAuth settings
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    APPLE_CLIENT_ID = os.environ.get('APPLE_CLIENT_ID')
    APPLE_TEAM_ID = os.environ.get('APPLE_TEAM_ID')
    APPLE_KEY_ID = os.environ.get('APPLE_KEY_ID')
    APPLE_PRIVATE_KEY = os.environ.get('APPLE_PRIVATE_KEY')
    
    # Ensure upload folder exists
    @classmethod
    def init_app(cls) -> None:
        """Initialize application configuration."""
        os.makedirs(cls.UPLOAD_FOLDER, exist_ok=True)


class DevelopmentConfig(Config):
    """Development environment configuration."""
    DEBUG = True
    
    
class TestingConfig(Config):
    """Testing environment configuration."""
    TESTING = True
    DEBUG = True
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'test_uploads')
    

class ProductionConfig(Config):
    """Production environment configuration."""
    # In production, ensure SECRET_KEY is properly set
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Production should use proper log handling
    LOG_LEVEL = 'INFO'
    
    # Stricter content security
    CONTENT_SECURITY_POLICY = True


# Dictionary of available configurations
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


# Helper function to get current config
def get_config() -> Config:
    """
    Get the current configuration based on environment variables.
    
    Returns:
        Config: Configuration class instance
    """
    env = os.environ.get('FLASK_ENV', 'default')
    return config.get(env, config['default'])