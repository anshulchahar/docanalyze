// Using global React and ReactDOM from script tags
(function () {
  // Authentication context to manage user state across the app
  const AuthContext = React.createContext(null);

  const useAuth = () => React.useContext(AuthContext);

  const AuthProvider = ({ children }) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    // Check if user is authenticated on initial load
    React.useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem('authToken');

        if (token) {
          try {
            // Set default auth header for all requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Fetch current user info
            const response = await axios.get('/api/auth/user');
            setUser(response.data.user);
          } catch (error) {
            console.error('Authentication check failed:', error);
            localStorage.removeItem('authToken');
          }
        }

        setLoading(false);
      };

      checkAuth();
    }, []);

    // Login function
    const login = (userData, token) => {
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
    };

    // Logout function
    const logout = async () => {
      try {
        await axios.post('/api/auth/logout');
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      }
    };

    const value = {
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    };

    return React.createElement(AuthContext.Provider, { value }, children);
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
      return React.createElement('div', null, 'Loading...');
    }

    if (!user) {
      return React.createElement(ReactRouterDOM.Navigate, { to: "/login" });
    }

    return children;
  };

  // Login Component
  const Login = () => {
    const [formData, setFormData] = React.useState({
      email: '',
      password: '',
      remember_me: false
    });
    const [errors, setErrors] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const navigate = ReactRouterDOM.useNavigate();
    const location = ReactRouterDOM.useLocation();
    const { login } = useAuth();

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
          // Store token and login user
          if (response.data.token) {
            login(response.data.user, response.data.token);
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

    React.useEffect(() => {
      console.log("Login component mounted");
    }, []);

    return React.createElement(
      'div',
      { className: "min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" },
      React.createElement(
        'div',
        { className: "max-w-md w-full space-y-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 sm:p-10 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-xl" },
        [
          // Logo and header section
          React.createElement(
            'div',
            { className: "text-center", key: "header" },
            [
              React.createElement(
                'div',
                { className: "flex justify-center", key: "logo-container" },
                React.createElement('img', {
                  src: "/static/img/logo.png",
                  alt: "DocAnalyze Logo",
                  className: "h-12 w-auto"
                })
              ),
              React.createElement('h2', {
                className: "mt-6 text-3xl font-extrabold text-gray-900 dark:text-white",
                key: "title"
              }, "Welcome back"),
              React.createElement('p', {
                className: "mt-2 text-sm text-gray-600 dark:text-gray-300",
                key: "subtitle"
              }, "Sign in to your account")
            ]
          ),

          // Error message
          errors.api && React.createElement(
            'div',
            {
              className: "rounded-md bg-red-50 dark:bg-red-900/30 p-4 mt-4",
              key: "api-error-container"
            },
            React.createElement(
              'div',
              { className: "flex" },
              [
                React.createElement(
                  'div',
                  { className: "flex-shrink-0", key: "error-icon" },
                  React.createElement(
                    'svg',
                    {
                      className: "h-5 w-5 text-red-400",
                      viewBox: "0 0 20 20",
                      fill: "currentColor",
                      "aria-hidden": "true"
                    },
                    React.createElement('path', {
                      fillRule: "evenodd",
                      d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
                      clipRule: "evenodd"
                    })
                  )
                ),
                React.createElement(
                  'div',
                  { className: "ml-3", key: "error-content" },
                  React.createElement('p', {
                    className: "text-sm text-red-700 dark:text-red-200",
                    key: "error-text"
                  }, errors.api)
                )
              ]
            )
          ),

          // Form
          React.createElement(
            'form',
            { className: "mt-8 space-y-6", onSubmit: handleSubmit, key: "form" },
            [
              React.createElement('input', { type: "hidden", name: "remember", value: "true", key: "remember-hidden" }),
              React.createElement(
                'div',
                { className: "rounded-md shadow-sm -space-y-px", key: "inputs-container" },
                [
                  React.createElement(
                    'div',
                    { key: "email-input-container" },
                    [
                      React.createElement('label', {
                        htmlFor: "email",
                        className: "sr-only",
                        key: "email-label"
                      }, "Email address"),
                      React.createElement('input', {
                        id: "email",
                        name: "email",
                        type: "email",
                        autoComplete: "email",
                        required: true,
                        value: formData.email,
                        onChange: handleChange,
                        className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm",
                        placeholder: "Email address",
                        key: "email-input"
                      }),
                      errors.email && React.createElement(
                        'p',
                        {
                          className: "absolute text-xs text-red-500 mt-1 ml-2",
                          key: "email-error"
                        },
                        errors.email
                      )
                    ]
                  ),
                  React.createElement(
                    'div',
                    { key: "password-input-container" },
                    [
                      React.createElement('label', {
                        htmlFor: "password",
                        className: "sr-only",
                        key: "password-label"
                      }, "Password"),
                      React.createElement('input', {
                        id: "password",
                        name: "password",
                        type: "password",
                        autoComplete: "current-password",
                        required: true,
                        value: formData.password,
                        onChange: handleChange,
                        className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm",
                        placeholder: "Password",
                        key: "password-input"
                      }),
                      errors.password && React.createElement(
                        'p',
                        {
                          className: "text-xs text-red-500 mt-1 ml-2",
                          key: "password-error"
                        },
                        errors.password
                      )
                    ]
                  )
                ]
              ),

              React.createElement(
                'div',
                { className: "flex items-center justify-between", key: "remember-forgot" },
                [
                  React.createElement(
                    'div',
                    { className: "flex items-center", key: "remember-container" },
                    [
                      React.createElement('input', {
                        id: "remember_me",
                        name: "remember_me",
                        type: "checkbox",
                        checked: formData.remember_me,
                        onChange: handleChange,
                        className: "h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded",
                        key: "remember-checkbox"
                      }),
                      React.createElement('label', {
                        htmlFor: "remember_me",
                        className: "ml-2 block text-sm text-gray-900 dark:text-gray-300",
                        key: "remember-text"
                      }, "Remember me")
                    ]
                  ),
                  React.createElement('div', { className: "text-sm", key: "forgot-container" },
                    React.createElement('a', {
                      href: "#",
                      className: "font-medium text-accent hover:text-accent/80",
                      key: "forgot-link"
                    }, "Forgot your password?")
                  )
                ]
              ),

              React.createElement(
                'div',
                { key: "submit-container" },
                React.createElement('button', {
                  type: "submit",
                  disabled: isSubmitting,
                  className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors duration-200 ease-in-out",
                  key: "submit-button"
                }, [
                  React.createElement(
                    'span',
                    { className: "absolute left-0 inset-y-0 flex items-center pl-3", key: "button-icon" },
                    React.createElement(
                      'svg',
                      {
                        className: "h-5 w-5 text-accent/80 group-hover:text-accent/90",
                        xmlns: "http://www.w3.org/2000/svg",
                        viewBox: "0 0 20 20",
                        fill: "currentColor",
                        "aria-hidden": "true"
                      },
                      React.createElement('path', {
                        fillRule: "evenodd",
                        d: "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z",
                        clipRule: "evenodd"
                      })
                    )
                  ),
                  isSubmitting ? "Signing in..." : "Sign in"
                ])
              )
            ]
          ),

          // Divider
          React.createElement(
            'div',
            { className: "mt-6", key: "divider-container" },
            React.createElement(
              'div',
              { className: "relative", key: "divider" },
              [
                React.createElement('div', {
                  className: "absolute inset-0 flex items-center",
                  key: "divider-line"
                },
                  React.createElement('div', {
                    className: "w-full border-t border-gray-300 dark:border-gray-600"
                  })
                ),
                React.createElement('div', {
                  className: "relative flex justify-center text-sm",
                  key: "divider-text"
                },
                  React.createElement('span', {
                    className: "px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }, "Or continue with")
                )
              ]
            )
          ),

          // Social logins
          React.createElement(
            'div',
            { className: "mt-6", key: "social-container" },
            React.createElement(
              'div',
              { className: "grid grid-cols-1 gap-3", key: "social-buttons" },
              React.createElement('button', {
                onClick: handleGoogleLogin,
                type: "button",
                className: "w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out",
                key: "google-button"
              }, [
                React.createElement(
                  'svg',
                  {
                    className: "w-5 h-5 mr-2",
                    viewBox: "0 0 24 24",
                    key: "google-icon"
                  },
                  React.createElement('path', {
                    d: "M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z",
                    fill: "#DB4437"
                  })
                ),
                "Continue with Google"
              ])
            )
          ),

          // Sign up link
          React.createElement(
            'div',
            { className: "mt-6 text-center", key: "signup-container" },
            React.createElement('p', {
              className: "text-sm text-gray-600 dark:text-gray-400",
              key: "signup-text"
            }, [
              "Don't have an account? ",
              React.createElement(
                ReactRouterDOM.Link,
                {
                  to: "/register",
                  className: "font-medium text-accent hover:text-accent/80 transition-colors duration-200",
                  key: "signup-link"
                },
                "Sign up"
              )
            ])
          )
        ]
      )
    );
  };

  // Register Component
  const Register = () => {
    const [formData, setFormData] = React.useState({
      name: '',
      email: '',
      password: '',
      password2: ''
    });
    const [errors, setErrors] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const navigate = ReactRouterDOM.useNavigate();

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

    React.useEffect(() => {
      console.log("Register component mounted");
    }, []);

    const handleGoogleLogin = () => {
      window.location.href = '/auth/login/google';
    };

    const handleAppleLogin = () => {
      window.location.href = '/auth/login/apple';
    };

    return React.createElement(
      'div',
      { className: "min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" },
      React.createElement(
        'div',
        { className: "max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-10 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-xl" },
        [
          // Logo and header section
          React.createElement(
            'div',
            { className: "text-center", key: "header" },
            [
              React.createElement(
                'div',
                { className: "flex justify-center", key: "logo-container" },
                React.createElement('img', {
                  src: "/static/img/logo.png",
                  alt: "DocAnalyze Logo",
                  className: "h-12 w-auto"
                })
              ),
              React.createElement('h2', {
                className: "mt-6 text-3xl font-extrabold text-gray-900 dark:text-white",
                key: "title"
              }, "Create an account"),
              React.createElement('p', {
                className: "mt-2 text-sm text-gray-600 dark:text-gray-300",
                key: "subtitle"
              }, "Get started with DocAnalyze today")
            ]
          ),

          // Error message
          errors.api && React.createElement(
            'div',
            { className: "rounded-md bg-red-50 dark:bg-red-900/30 p-4 my-4", key: "api-error-container" },
            React.createElement(
              'div',
              { className: "flex" },
              [
                React.createElement(
                  'div',
                  { className: "flex-shrink-0", key: "error-icon" },
                  React.createElement(
                    'svg',
                    {
                      className: "h-5 w-5 text-red-400",
                      viewBox: "0 0 20 20",
                      fill: "currentColor",
                      "aria-hidden": "true"
                    },
                    React.createElement('path', {
                      fillRule: "evenodd",
                      d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
                      clipRule: "evenodd"
                    })
                  )
                ),
                React.createElement(
                  'div',
                  { className: "ml-3", key: "error-content" },
                  React.createElement('p', {
                    className: "text-sm text-red-700 dark:text-red-200",
                    key: "error-text"
                  }, errors.api)
                )
              ]
            )
          ),

          // Form
          React.createElement(
            'form',
            { className: "mt-8 space-y-6", onSubmit: handleSubmit, key: "register-form" },
            [
              React.createElement('div', { className: "rounded-md shadow-sm -space-y-px", key: "inputs-container" }, [
                // Name field
                React.createElement(
                  'div',
                  { key: "name-input-container" },
                  [
                    React.createElement('label', {
                      htmlFor: "name",
                      className: "sr-only",
                      key: "name-label"
                    }, "Name"),
                    React.createElement('input', {
                      id: "name",
                      name: "name",
                      type: "text",
                      autoComplete: "name",
                      required: true,
                      value: formData.name,
                      onChange: handleChange,
                      className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm",
                      placeholder: "Full name",
                      key: "name-input"
                    }),
                    errors.name && React.createElement('p', {
                      className: "absolute text-xs text-red-500 mt-1 ml-2",
                      key: "name-error"
                    }, errors.name)
                  ]
                ),

                // Email field
                React.createElement(
                  'div',
                  { key: "email-input-container" },
                  [
                    React.createElement('label', {
                      htmlFor: "email",
                      className: "sr-only",
                      key: "email-label"
                    }, "Email address"),
                    React.createElement('input', {
                      id: "email",
                      name: "email",
                      type: "email",
                      autoComplete: "email",
                      required: true,
                      value: formData.email,
                      onChange: handleChange,
                      className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm",
                      placeholder: "Email address",
                      key: "email-input"
                    }),
                    errors.email && React.createElement('p', {
                      className: "absolute text-xs text-red-500 mt-1 ml-2",
                      key: "email-error"
                    }, errors.email)
                  ]
                ),

                // Password field
                React.createElement(
                  'div',
                  { key: "password-input-container" },
                  [
                    React.createElement('label', {
                      htmlFor: "password",
                      className: "sr-only",
                      key: "password-label"
                    }, "Password"),
                    React.createElement('input', {
                      id: "password",
                      name: "password",
                      type: "password",
                      autoComplete: "new-password",
                      required: true,
                      value: formData.password,
                      onChange: handleChange,
                      className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm",
                      placeholder: "Password (min. 8 characters)",
                      key: "password-input"
                    }),
                    errors.password && React.createElement('p', {
                      className: "absolute text-xs text-red-500 mt-1 ml-2",
                      key: "password-error"
                    }, errors.password)
                  ]
                ),

                // Confirm Password field
                React.createElement(
                  'div',
                  { key: "password2-input-container" },
                  [
                    React.createElement('label', {
                      htmlFor: "password2",
                      className: "sr-only",
                      key: "password2-label"
                    }, "Confirm Password"),
                    React.createElement('input', {
                      id: "password2",
                      name: "password2",
                      type: "password",
                      autoComplete: "new-password",
                      required: true,
                      value: formData.password2,
                      onChange: handleChange,
                      className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm",
                      placeholder: "Confirm password",
                      key: "password2-input"
                    }),
                    errors.password2 && React.createElement('p', {
                      className: "absolute text-xs text-red-500 mt-1 ml-2",
                      key: "password2-error"
                    }, errors.password2)
                  ]
                )
              ]),

              // Submit button
              React.createElement(
                'div',
                { key: "submit-container" },
                React.createElement('button', {
                  type: "submit",
                  disabled: isSubmitting,
                  className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors duration-200 ease-in-out",
                  key: "submit-button"
                }, [
                  React.createElement(
                    'span',
                    { className: "absolute left-0 inset-y-0 flex items-center pl-3", key: "button-icon" },
                    React.createElement(
                      'svg',
                      {
                        className: "h-5 w-5 text-accent/70 group-hover:text-accent/90",
                        xmlns: "http://www.w3.org/2000/svg",
                        viewBox: "0 0 20 20",
                        fill: "currentColor",
                        "aria-hidden": "true"
                      },
                      React.createElement('path', {
                        fillRule: "evenodd",
                        d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z",
                        clipRule: "evenodd"
                      })
                    )
                  ),
                  isSubmitting ? "Creating account..." : "Sign up"
                ])
              )
            ]
          ),

          // Divider
          React.createElement(
            'div',
            { className: "mt-6", key: "divider-container" },
            React.createElement(
              'div',
              { className: "relative", key: "divider" },
              [
                React.createElement('div', {
                  className: "absolute inset-0 flex items-center",
                  key: "divider-line"
                },
                  React.createElement('div', {
                    className: "w-full border-t border-gray-300 dark:border-gray-600"
                  })
                ),
                React.createElement('div', {
                  className: "relative flex justify-center text-sm",
                  key: "divider-text"
                },
                  React.createElement('span', {
                    className: "px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }, "Or sign up with")
                )
              ]
            )
          ),

          // Social Buttons
          React.createElement(
            'div',
            { className: "mt-6 grid grid-cols-2 gap-3", key: "social-buttons-container" },
            [
              React.createElement('button', {
                type: "button",
                onClick: handleGoogleLogin,
                className: "w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out",
                key: "google-button"
              }, [
                React.createElement(
                  'svg',
                  {
                    className: "w-5 h-5 mr-2",
                    viewBox: "0 0 24 24",
                    key: "google-icon"
                  },
                  React.createElement('path', {
                    d: "M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z",
                    fill: "#DB4437"
                  })
                ),
                "Google"
              ]),

              React.createElement('button', {
                type: "button",
                onClick: handleAppleLogin,
                className: "w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out",
                key: "apple-button"
              }, [
                React.createElement(
                  'svg',
                  {
                    className: "w-5 h-5 mr-2",
                    viewBox: "0 0 24 24",
                    fill: "currentColor",
                    key: "apple-icon"
                  },
                  React.createElement('path', {
                    d: "M16.462,1c0.381,0,2.482,0.001,3.988,1.539c-0.104,0.063-2.415,1.409-2.389,4.217c0.031,3.342,2.926,4.451,2.939,4.459c-0.026,0.069-0.476,1.647-1.585,3.228c-0.934,1.393-1.914,2.747-3.459,2.775c-0.51,0.024-0.872-0.089-1.248-0.208c-0.39-0.123-0.792-0.249-1.419-0.249c-0.652,0-1.072,0.13-1.477,0.257c-0.358,0.112-0.699,0.218-1.175,0.207c-1.488-0.03-2.621-1.584-3.569-2.969c-1.949-2.797-3.449-7.875-1.436-11.312c0.988-1.713,2.768-2.847,4.682-2.876c0.645-0.023,1.276,0.213,1.825,0.413c0.417,0.154,0.785,0.28,1.071,0.28c0.247,0,0.605-0.118,1.019-0.265c0.632-0.221,1.427-0.514,2.229-0.439L16.462,1z M12.225,1c0.069,0.557,0.109,1.119-0.106,1.712c-0.267,0.682-0.836,1.39-1.56,1.765c-0.692,0.36-1.631,0.421-2.302,0.296c-0.12-0.857,0.246-1.719,0.753-2.339C9.52,1.785,10.694,1.112,12.225,1z"
                  })
                ),
                "Apple"
              ])
            ]
          ),

          // Already have an account
          React.createElement(
            'div',
            { className: "mt-6 text-center", key: "login-link-container" },
            React.createElement('p', {
              className: "text-sm text-gray-600 dark:text-gray-400",
              key: "login-text"
            }, [
              "Already have an account? ",
              React.createElement(
                ReactRouterDOM.Link,
                {
                  to: "/login",
                  className: "font-medium text-accent hover:text-accent/80 transition-colors duration-200",
                  key: "login-link"
                },
                "Sign in"
              )
            ])
          )
        ]
      )
    );
  };

  // Main App component with support for auth/* paths
  const App = () => {
    console.log("App component rendering");
    const { useState } = React;
    const path = window.location.pathname;

    // Function to determine which component to render based on path
    const getComponent = () => {
      console.log("Determining component for path:", path);

      if (path === "/login" || path === "/auth/login") {
        console.log("Rendering Login component");
        return React.createElement(Login);
      }

      if (path === "/register" || path === "/auth/register") {
        console.log("Rendering Register component");
        return React.createElement(Register);
      }

      console.log("No matching component for path");
      return React.createElement("div", null, "Page not found");
    };

    // Instead of using React Router, conditionally render components based on path
    return getComponent();
  };

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM content loaded - initializing React");
    const rootElement = document.getElementById('root');

    if (rootElement) {
      console.log("Root element found, rendering React app");
      ReactDOM.createRoot(rootElement).render(React.createElement(App));
    } else {
      console.error("Root element not found, cannot render React app");
    }

    // For non-React parts of the app that need auth functionality
    window.logout = async () => {
      try {
        await axios.post('/api/auth/logout');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
  });
})();
