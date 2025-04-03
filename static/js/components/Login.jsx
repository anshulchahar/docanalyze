import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember_me: false
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email address is invalid';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                const response = await axios.post('/api/auth/login', formData);
                // Store token if returned
                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                }

                // Redirect to the home page or the page user tried to access
                const nextPage = new URLSearchParams(location.search).get('next') || '/';
                navigate(nextPage);
            } catch (error) {
                setErrors({
                    api: error.response?.data?.message || 'Invalid email or password'
                });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/auth/login/google';
    };

    return (
        <div className="w-full flex items-center justify-center py-12">
            <div className="claude-card">
                <div className="logo-corner">
                    <img src="/static/img/logo.png" alt="DocAnalyze Logo" className="corner-logo" />
                </div>
                <div className="claude-header">
                    <h2 className="claude-logo">solva</h2>
                    <p>Welcome back to Solva</p>
                </div>
                <form className="claude-form" onSubmit={handleSubmit}>
                    <div className="claude-input-group">
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="claude-input"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                    </div>
                    <div className="claude-input-group">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="claude-input"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember_me"
                                name="remember_me"
                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                                checked={formData.remember_me}
                                onChange={handleChange}
                            />
                            <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-500 mt-2">
                                Remember Me
                            </label>
                        </div>
                        <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-500">
                            Forgot password?
                        </a>
                    </div>
                    {errors.api && <div className="text-red-500 text-sm mb-4">{errors.api}</div>}
                    <button
                        type="submit"
                        className="claude-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                    <div className="claude-divider">
                        <span>Or continue with</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="claude-social-button"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                        </svg>
                        Continue with Google
                    </button>
                    <div className="claude-footer">
                        Don't have an account?
                        <Link to="/register"> Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;