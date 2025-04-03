import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) {
            newErrors.name = 'Name is required';
        }
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email address is invalid';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (!formData.password2) {
            newErrors.password2 = 'Please confirm your password';
        } else if (formData.password !== formData.password2) {
            newErrors.password2 = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                await axios.post('/api/auth/register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                // Show success message and redirect to login
                navigate('/login', {
                    state: { message: 'Registration successful! Please log in.' }
                });
            } catch (error) {
                setErrors({
                    api: error.response?.data?.message || 'Registration failed. Please try again.'
                });
                if (error.response?.data?.field) {
                    setErrors({
                        ...errors,
                        [error.response.data.field]: error.response.data.message
                    });
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/auth/login/google';
    };

    const handleAppleLogin = () => {
        window.location.href = '/auth/login/apple';
    };

    return (
        <div className="window mx-auto max-w-md mt-10">
            <div className="window-title">
                <span>Register.exe</span>
                <div className="window-title-buttons">
                    <div className="title-button">_</div>
                    <div className="title-button">□</div>
                    <div className="title-button">×</div>
                </div>
            </div>
            <div className="window-body p-6">
                <h2 className="text-xl mb-4">Create a DocAnalyze Account</h2>
                {errors.api && <div className="error-message mb-4">{errors.api}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-bold mb-2">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3"
                        />
                        {errors.name && <div className="error-message mt-1">{errors.name}</div>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3"
                        />
                        {errors.email && <div className="error-message mt-1">{errors.email}</div>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3"
                        />
                        {errors.password && <div className="error-message mt-1">{errors.password}</div>}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password2" className="block text-sm font-bold mb-2">Confirm Password</label>
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            value={formData.password2}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3"
                        />
                        {errors.password2 && <div className="error-message mt-1">{errors.password2}</div>}
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            {isSubmitting ? 'Registering...' : 'Register'}
                        </button>

                        <Link
                            to="/login"
                            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                        >
                            Already have an account? Login
                        </Link>
                    </div>
                </form>

                <div className="mt-6 pt-6 border-t">
                    <p className="text-center mb-4">Or sign up with:</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={handleAppleLogin}
                            className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Apple
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;