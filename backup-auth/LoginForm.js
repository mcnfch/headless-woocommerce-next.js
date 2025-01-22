'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const LoginForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login, showPostLogin } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('Submitting login form...');
      await login(formData);
      console.log('Login successful, waiting for post-login modal...');
      // Only close if login was successful but post-login modal isn't showing
      if (!showPostLogin) {
        onClose();
      }
    } catch (err) {
      console.error('Login error in form:', err);
      setError(err.message || 'Failed to login. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username or Email
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
      >
        Login
      </button>

      <div className="text-center text-sm text-gray-500">
        <button
          type="button"
          className="hover:text-black"
          onClick={() => {/* TODO: Implement forgot password */}}
        >
          Forgot your password?
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
