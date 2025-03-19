'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Trash2, Users } from 'lucide-react';
import * as UserAPI from '@/lib/api/User';
import type { User } from '@/types';

export default function FirmManagementPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [lawyers, setLawyers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newLawyer, setNewLawyer] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'firm')) {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await UserAPI.getFirmLawyers();
        if ('error' in response) {
          throw new Error(response.error);
        }
        setLawyers(response);
      } catch (error) {
        console.error('Error fetching lawyers:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch lawyers. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'firm') {
      fetchLawyers();
    }
  }, [user, toast]);

  const handleAddL