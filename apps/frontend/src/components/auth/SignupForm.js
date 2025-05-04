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
  name: yup.string().required('Name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function SignupForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Handle email/password signup
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Sign up the user in Firebase
      const result = await signup(data.email, data.password, data.name);
      
      // Force refresh the Firebase ID token to get the latest profile info
      const idToken = await result.user.getIdToken(true);

      // Register the user in MongoDB via the backend API
      await userService.registerUser(idToken, { displayName: data.name });
      
      toast.success('Account created successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
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
      
      // Force refresh the Firebase ID token to get the latest profile info
      const idToken = await result.user.getIdToken(true);
      
      // Register user in MongoDB if not already registered
      try {
        await userService.registerUser(idToken, {
          displayName: result.user.displayName
        });
      } catch (err) {
        // Ignore if user already exists
        if (!err.message?.includes('User already exists')) {
          throw err;
        }
      }
      
      toast.success('Signed up with Google successfully!', { 
        position: "bottom-right",
        autoClose: 3000
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to sign up with Google', {
        position: "bottom-right",
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Create Account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Your Name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            {...register('confirmPassword')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="******"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
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
        Sign up with Google
      </button>
    </div>
  );
} 