from flask import Blueprint, render_template, redirect, url_for, flash, request, session, current_app
from flask_login import login_user, logout_user, login_required, current_user
from docanalyze.models import db, User
from docanalyze.auth.forms import LoginForm, RegistrationForm
from docanalyze import oauth  # Import the configured OAuth instance

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('web.index'))
        
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('web.index'))
        flash('Invalid email or password')
    
    return render_template('auth/login.html', form=form)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('web.index'))
        
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(email=form.email.data, name=form.name.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful!')
        return redirect(url_for('auth.login'))
        
    return render_template('auth/register.html', form=form)

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
    user_info = oauth.google.get('userinfo').json()
    
    # Check if user exists
    user = User.query.filter_by(oauth_id=user_info['id'], oauth_provider='google').first()
    if not user:
        # Check if email exists
        user = User.query.filter_by(email=user_info['email']).first()
        if user:
            # Link existing account
            user.oauth_id = user_info['id']
            user.oauth_provider = 'google'
        else:
            # Create new user
            user = User(
                email=user_info['email'],
                name=user_info['name'],
                oauth_id=user_info['id'],
                oauth_provider='google'
            )
            db.session.add(user)
        
        db.session.commit()
    
    login_user(user)
    return redirect(url_for('web.index'))

# Simple placeholder route for Apple login - commented out for future implementation
'''
@auth_bp.route('/apple/login')
def apple_login():
    # TODO: Implement Apple login
    flash('Apple login is not yet implemented', 'info')
    return redirect(url_for('auth.login'))
'''

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