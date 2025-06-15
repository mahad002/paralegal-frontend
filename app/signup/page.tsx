'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as UserAPI from '@/lib/api/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Scale, Gavel, Mail, Lock, User, Briefcase } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'legal_researcher' | 'lawyer' | 'judge' | 'legal_professional'>('legal_researcher');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
        title: 'Signup successful',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-6">
            <Scale className="w-10 h-10 text-cyan-400" />
            <Gavel className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Enter your details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Select 
                value={role}
                onValueChange={(value: 'legal_researcher' | 'lawyer' | 'judge' | 'legal_professional') => setRole(value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full pl-10 bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="legal_researcher" className="text-white">Legal Researcher</SelectItem>
                  <SelectItem value="lawyer" className="text-white">Lawyer</SelectItem>
                  <SelectItem value="judge" className="text-white">Judge</SelectItem>
                  <SelectItem value="legal_professional" className="text-white">Legal Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 8 characters long</li>
              <li>Contains uppercase and lowercase letters</li>
              <li>Contains at least one number</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}