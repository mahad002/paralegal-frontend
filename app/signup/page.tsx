'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as UserAPI from '@/lib/api/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Scale, Gavel, Mail, Lock, User, Briefcase, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'legal_researcher' | 'lawyer' | 'judge' | 'legal_professional'>('legal_researcher');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  const validateForm = useCallback(() => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return false;
    }

    if (name.trim().length < 2) {
      toast({
        title: 'Error',
        description: 'Name must be at least 2 characters long',
        variant: 'destructive',
      });
      return false;
    }

    if (!email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your email',
        variant: 'destructive',
      });
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return false;
    }

    if (!password.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a password',
        variant: 'destructive',
      });
      return false;
    }

    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return false;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast({
        title: 'Error',
        description: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  }, [name, email, password, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await UserAPI.signup(name.trim(), email.trim(), password, role);
      
      if ('error' in response) {
        throw new Error(response.error);
      }

      toast({
        title: 'Account created successfully!',
        description: 'Please log in with your new account.',
      });
      router.push('/login');
    } catch (error) {
      let errorMessage = 'An error occurred during signup.';
      
      if (error instanceof Error) {
        if (error.message.includes('email already exists') || error.message.includes('duplicate')) {
          errorMessage = 'An account with this email already exists.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'Signup failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'legal_researcher', label: 'Legal Researcher', description: 'Research and analysis specialist' },
    { value: 'lawyer', label: 'Lawyer', description: 'Licensed legal practitioner' },
    { value: 'judge', label: 'Judge', description: 'Judicial officer' },
    { value: 'legal_professional', label: 'Legal Professional', description: 'General legal professional' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(30,64,175,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(245,158,11,0.05)_50%,transparent_75%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center items-center mb-6"
          >
            <div className="p-4 bg-gradient-to-br from-navy-800/50 to-navy-700/50 rounded-2xl border border-gold-500/30 shadow-xl">
              <img 
                src="/image.png" 
                alt="Paralegal Logo" 
                className="h-16 w-auto"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white font-serif mb-2">
              Create Account
            </h1>
            <p className="text-slate-300 text-lg">Create your professional account</p>
          </motion.div>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="glass-card p-8 rounded-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gold-100">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 professional-input h-12"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gold-100">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 professional-input h-12"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gold-100">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10 professional-input h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-gold-100 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-navy-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      Password strength: <span className={`font-medium ${passwordStrength >= 3 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gold-100">Professional Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 z-10" />
                  <Select 
                    value={role}
                    onValueChange={(value: 'legal_researcher' | 'lawyer' | 'judge' | 'legal_professional') => setRole(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="pl-10 professional-input h-12">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-navy-900/95 backdrop-blur-sm border-navy-700/50">
                      {roleOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value} 
                          className="text-slate-100 hover:bg-navy-800/50"
                        >
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-slate-400">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="space-y-3 p-4 bg-navy-800/30 rounded-xl border border-navy-700/30">
              <p className="text-sm font-medium text-gold-100">Password requirements:</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {[
                  { check: password.length >= 8, text: 'At least 8 characters' },
                  { check: /[A-Z]/.test(password), text: 'One uppercase letter' },
                  { check: /[a-z]/.test(password), text: 'One lowercase letter' },
                  { check: /\d/.test(password), text: 'One number' },
                ].map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className={`h-3 w-3 ${req.check ? 'text-green-300' : 'text-slate-500'}`} />
                    <span className={req.check ? 'text-green-300' : 'text-slate-400'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || passwordStrength < 3}
              className="w-full gold-button h-12 font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-300">
              Already have an account?{' '}
              <Link href="/login" className="text-gold-400 hover:text-gold-300 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Shield className="h-4 w-4" />
            <span>Your data is protected with enterprise-grade security</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}