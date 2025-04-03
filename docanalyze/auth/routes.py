from flask import Blueprint, render_template, redirect, url_for, flash, request, session, current_app
from flask_login import login_user, logout_user, login_required, current_user
from docanalyze.models import db, User
from docanalyze.auth.forms import LoginForm, RegistrationForm
from docanalyze import oauth  # Import the configured OAuth instance

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['GET'])
def login():
    # Just render a template that will load the React app
    # React router will handle showing the login component
    return render_template('base.html', title="Login", page_name="login")

@auth_bp.route('/register', methods=['GET'])
def register():
    # Just render a template that will load the React app
    # React router will handle showing the register component
    return render_template('base.html', title="Register", page_name="register")

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('web.index'))

# OAuth routes for Google
@auth_bp.route('/login/google')
def google_login():
    if 'google' not in oauth._registry:
        flash('Google login is not configured. Please check your environment variables.', 'error')
        return redirect(url_for('auth.login'))
    
    redirect_uri = url_for('auth.google_authorize', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@auth_bp.route('/login/google/callback')
def google_authorize():
    if 'google' not in oauth._registry:
        flash('Google login is not configured. Please check your environment variables.', 'error')
        return redirect(url_for('auth.login'))
    
    token = oauth.google.authorize_access_token()
    resp = oauth.google.get('https://www.googleapis.com/oauth2/v3/userinfo')
    user_info = resp.json()
    
    # Check if user exists
    user = User.query.filter_by(oauth_id=user_info['sub'], oauth_provider='google').first()
    if not user:
        # Check if email exists
        user = User.query.filter_by(email=user_info['email']).first()
        if user:
            # Link existing account
            user.oauth_id = user_info['sub']
            user.oauth_provider = 'google'
        else:
            # Create new user
            user = User(
                email=user_info['email'],
                name=user_info['name'],
                oauth_id=user_info['sub'],
                oauth_provider='google'
            )
            db.session.add(user)
        
        db.session.commit()
    
    login_user(user)
    
    # Generate JWT token for React app
    import jwt
    from datetime import datetime, timedelta
    from docanalyze.config.settings import get_config
    
    config = get_config()
    secret_key = config.SECRET_KEY
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, secret_key, algorithm='HS256')
    
    # Return token as URL parameter to be used by the React app
    return redirect(url_for('web.index', token=token))

# Simple placeholder route for Apple login (updated to return to React app)
@auth_bp.route('/login/apple')
def apple_login():
    flash('Apple login is not yet implemented', 'info')
    return redirect(url_for('auth.login'))

# Apple OAuth routes - commented out for now
'''
@auth_bp.route('/login/apple')
def apple_login():
    if 'apple' not in oauth._registry:
        flash('Apple login is not configured. Please check your environment variables.', 'error')
        return redirect(url_for('auth.login'))
    
    redirect_uri = url_for('auth.apple_authorize', _external=True)
    return oauth.apple.authorize_redirect(redirect_uri)

@auth_bp.route('/login/apple/callback')
def apple_authorize():
    if 'apple' not in oauth._registry:
        flash('Apple login is not configured. Please check your environment variables.', 'error')
        return redirect(url_for('auth.login'))
    
    token = oauth.apple.authorize_access_token()
    user_info = oauth.apple.parse_id_token(token)
    
    # Check if user exists
    user = User.query.filter_by(oauth_id=user_info['sub'], oauth_provider='apple').first()
    if not user:
        # Check if email exists
        user = User.query.filter_by(email=user_info.get('email')).first()
        if user:
            # Link existing account
            user.oauth_id = user_info['sub']
            user.oauth_provider = 'apple'
        else:
            # Create new user
            user = User(
                email=user_info.get('email'),
                name=user_info.get('name', user_info.get('email', '').split('@')[0]),
                oauth_id=user_info['sub'],
                oauth_provider='apple'
            )
            db.session.add(user)
        
        db.session.commit()
    
    login_user(user)
    return redirect(url_for('web.index'))
'''

# Add routes without the /auth prefix to simplify React routing
@auth_bp.route('/login/route', methods=['GET'])
def react_login_redirect():
    # This will be registered at /login and redirect to /auth/login
    return redirect(url_for('auth.login'))