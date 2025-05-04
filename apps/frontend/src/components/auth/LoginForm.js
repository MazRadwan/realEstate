import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaGoogle } from 'react-icons/fa';
import userService from '@/services/userService';

// Validation schema
const schema = yup.object().shape({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

export default function LoginForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Handle email/password login
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Logged in successfully!', {
        position: "bottom-right",
        autoClose: 3000
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login', {
        position: "bottom-right",
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Firebase Google authentication
      const result = await signInWithGoogle();
      
      // Get the ID token
      const idToken = await result.user.getIdToken();
      
      // Try to register the user in case they don't exist in MongoDB yet
      try {
        await userService.registerUser(idToken, {
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        });
      } catch (err) {
        // Ignore error if user already exists
        if (!err.message?.includes('User already exists')) {
          console.warn('Non-critical error registering user:', err.message);
        }
      }
      
      toast.success('Logged in with Google successfully!', {
        position: "bottom-right",
        autoClose: 3000
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to login with Google', {
        position: "bottom-right",
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Login</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            {...register('password')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="******"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <span className="text-gray-500 dark:text-gray-400">or</span>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="mt-4 w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors dark:border-gray-600"
      >
        <FaGoogle className="mr-2" />
        Sign in with Google
      </button>
    </div>
  );
} 