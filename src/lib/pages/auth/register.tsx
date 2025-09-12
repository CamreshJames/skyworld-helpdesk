import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { encryptData, decryptData } from '../../utils/cryptoUtils';
import './auth.css';

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  organization: 'Vendor' | 'Client';
  organizationName: string;
}

function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    organization: 'Client',
    organizationName: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const aesKey = import.meta.env.VITE_AES_KEY;
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required (min 6 characters)';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.organization) {
      newErrors.organization = 'Please select an organization type';
    }
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!aesKey) {
      setErrors({ username: 'Encryption key is missing. Please contact support.' });
      return;
    }

    setLoading(true);
    try {
      const savedUsers = localStorage.getItem('users');
      let users: Array<{ username: string; password: string; organization: 'Vendor' | 'Client'; organizationName: string }> = [];
      if (savedUsers) {
        const decrypted = await decryptData(savedUsers, aesKey);
        users = JSON.parse(decrypted);
      }

      if (users.find(u => u.username === formData.username)) {
        setErrors({ username: 'Username already exists. Please choose another.' });
        return;
      }

      const newUser = {
        username: formData.username,
        password: formData.password,
        organization: formData.organization,
        organizationName: formData.organizationName,
      };
      users.push(newUser);

      const encryptedUsers = await encryptData(JSON.stringify(users), aesKey);
      localStorage.setItem('users', encryptedUsers);

      setSuccessMessage('Registration successful! You can now log in.');
      setTimeout(() => navigate({ to: '/auth/login' }), 2000);
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ username: 'Registration failed. Please try again.' });
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
              <h1 className="auth-title">Register</h1>
              <p className="auth-subtitle">Create your account to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter a unique username"
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
                  placeholder="Enter your password (min 6 chars)"
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <div className="error-message">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="red" strokeWidth="1.5" />
                      <path d="M8 4V9" stroke="red" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="12" r="1" fill="red" />
                    </svg>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="organizationName">Organization Name</label>
                <input
                  id="organizationName"
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  placeholder="Enter your organization name"
                  className={errors.organizationName ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.organizationName && (
                  <div className="error-message">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="red" strokeWidth="1.5" />
                      <path d="M8 4V9" stroke="red" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="12" r="1" fill="red" />
                    </svg>
                    {errors.organizationName}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="organization">Organization Type</label>
                <select
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  className={errors.organization ? 'input-error' : ''}
                  disabled={loading}
                >
                  <option value="Client">Client</option>
                  <option value="Vendor">Vendor</option>
                </select>
                {errors.organization && (
                  <div className="error-message">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="red" strokeWidth="1.5" />
                      <path d="M8 4V9" stroke="red" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="12" r="1" fill="red" />
                    </svg>
                    {errors.organization}
                  </div>
                )}
              </div>

              {successMessage && (
                <div className="success-message">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="green" strokeWidth="1.5" />
                    <path d="M5 8.5L7.5 11L11 6" stroke="green" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {successMessage}
                </div>
              )}

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'}
              </button>

              <div className="auth-footer">
                <p>
                  Already have an account? <Link to="/auth/login" className="auth-link">Login here</Link>
                  {' | '}
                  Forgot your password? <Link to="/auth/forgot-password" className="auth-link">Reset here</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
        <div className="auth-decoration-column">
          <h2 className="auth-decoration-title">Join Us</h2>
          <p className="auth-decoration-text">
            Create an account to start managing your tickets and collaborating with your organization.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;