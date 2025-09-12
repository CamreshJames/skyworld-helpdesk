import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { decryptData } from '../../utils/cryptoUtils';
import './auth.css';

interface LoginFormData {
  username: string;
  password: string;
}

function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const aesKey = import.meta.env.VITE_AES_KEY;
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setLoginError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!aesKey) {
      setLoginError('Encryption key is missing. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const savedUsers = localStorage.getItem('users');
      if (!savedUsers) {
        setLoginError('No users registered. Please register first.');
        return;
      }

      const decrypted = await decryptData(savedUsers, aesKey);
      const users = JSON.parse(decrypted) as Array<{ username: string; password: string; organization: 'Vendor' | 'Client'; organizationName: string }>;

      const user = users.find(u => u.username === formData.username && u.password === formData.password);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify({ username: user.username, organization: user.organization, organizationName: user.organizationName }));
        navigate({ to: '/' });
      } else {
        setLoginError('Invalid username or password.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-form-column">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h1 className="auth-title">Login</h1>
              <p className="auth-subtitle">Welcome back! Please sign in to your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                  className={errors.username ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.username && (
                  <div className="error-message">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="red" strokeWidth="1.5" />
                      <path d="M8 4V9" stroke="red" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="12" r="1" fill="red" />
                    </svg>
                    {errors.username}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className={errors.password ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.password && (
                  <div className="error-message">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="red" strokeWidth="1.5" />
                      <path d="M8 4V9" stroke="red" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="12" r="1" fill="red" />
                    </svg>
                    {errors.password}
                  </div>
                )}
              </div>

              {loginError && (
                <div className="error-message full-width">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="red" strokeWidth="1.5" />
                    <path d="M8 4V9" stroke="red" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="12" r="1" fill="red" />
                  </svg>
                  {loginError}
                </div>
              )}

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="auth-footer">
                <p>
                  Forgot your password? <Link to="/auth/forgot-password" className="auth-link">Reset here</Link>
                  {' | '}
                  Don't have an account? <Link to="/auth/register" className="auth-link">Register here</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
        <div className="auth-decoration-column">
          <h2 className="auth-decoration-title">Welcome Back</h2>
          <p className="auth-decoration-text">
            Log in to manage your tickets and connect with your organization seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;