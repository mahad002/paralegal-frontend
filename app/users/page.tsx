'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import * as UserAPI from '@/lib/api/User';
import type { User } from '@/types';
import { Trash2, UserPlus, Shield } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      if (user.role !== 'admin') {
        router.push('/');
        toast({
          title: 'Access Denied',
          description: 'Only administrators can access this page.',
          variant: 'destructive',
        });
        return;
      }

      try {
        setIsLoading(true);
        const fetchedUsers = await UserAPI.getAllUsers();

        if (Array.isArray(fetchedUsers)) {
          setUsers([...fetchedUsers]);
        } else {
          console.error('Error fetching users:', fetchedUsers);
          toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user, router, toast]);

  const handleDeleteUser = async (userId: string) => {
    if (user?.role !== 'admin') {
      toast({ title: 'Access Denied', description: 'Only administrators can perform this action.', variant: 'destructive' });
      return;
    }

    try {
      const response = await UserAPI.deleteUser(userId);
      if ('error' in response) {
        throw new Error(response.error);
      }

      toast({ title: 'User deleted', description: 'User has been successfully removed from the system' });
      setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete user', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">Loading users...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Contact</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user._id} className="border-gray-800">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-sm text-gray-400">ID: {user._id.slice(-6)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${user.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                          user.role === 'lawyer' ? 'bg-blue-500/10 text-blue-500' :
                          user.role === 'firm' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-gray-500/10 text-gray-500'}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                          Active
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                          className="bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-gray-800">
                    <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}