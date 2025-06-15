'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as UserAPI from '@/lib/api/User';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect } from '@/components/ui/modern-select';
import { useNotification } from '@/components/ui/notification-manager';
import { Scale, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User as UserType } from '@/types';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'legal_researcher' as UserType['role']
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addNotification } = useNotification();

  const validateForm = () => {
    if (!formData.name.trim()) {
      addNotification({
        type: 'warning',
        title: 'Name Required',
        message: 'Please enter your full name',
        duration: 5000
      });
      return false;
    }

    if (!formData.email.trim()) {
      addNotification({
        type: 'warning',
        title: 'Email Required',
        message: 'Please enter your email address',
        duration: 5000
      });
      return false;
    }

    if (!formData.password.trim()) {
      addNotification({
        type: 'warning',
        title: 'Password Required',
        message: 'Please enter a password',
        duration: 5000
      });
      return false;
    }

    if (formData.password.length < 8) {
      addNotification({
        type: 'warning',
        title: 'Password Too Short',
        message: 'Password must be at least 8 characters long',
        duration: 5000
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      addNotification({
        type: 'warning',
        title: 'Passwords Don\'t Match',
        message: 'Please make sure both passwords match',
        duration: 5000
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await UserAPI.signup(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      
      if ('error' in response) {
        throw new Error(response.error);
      }

      addNotification({
        type: 'success',
        title: 'Account Created!',
        message: 'Please log in with your new account.',
        duration: 5000
      });
      
      router.push('/login');
    } catch (error) {
      let errorMessage = 'An error occurred during signup.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      addNotification({
        type: 'error',
        title: 'Signup Failed',
        message: errorMessage,
        duration: 8000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-purple-950/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center items-center gap-4 mb-6"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Scale className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Create Account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400"
          >
            Join our platform to get started
          </motion.p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <ModernInput
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              icon={<User className="h-4 w-4" />}
              required
            />

            <ModernInput
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
            />

            <div className="relative">
              <ModernInput
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                icon={<Lock className="h-4 w-4" />}
                helperText="Must be at least 8 characters long"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <ModernInput
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                icon={<Lock className="h-4 w-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <ModernSelect
              label="Role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value as UserType['role'])}
              required
            >
              <option value="legal_researcher">Legal Researcher</option>
              <option value="lawyer">Lawyer</option>
              <option value="judge">Judge</option>
              <option value="legal_professional">Legal Professional</option>
            </ModernSelect>

            <ModernButton
              type="submit"
              loading={isLoading}
              fullWidth
              size="lg"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </ModernButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          <p>© 2024 Paralegal Assistant. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}