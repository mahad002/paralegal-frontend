'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import type { User } from '@/types';
import { Trash2, UserPlus, Users, Shield } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
    });
    
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    // Verify admin role and fetch users
    useEffect(() => {
        const verifyAdminAndFetchUsers = async () => {
            try {
                // If no user or not admin, redirect to home
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

                const fetchedUsers = await api.getAllUsers();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to fetch users',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        verifyAdminAndFetchUsers();
    }, [user, router, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Verify admin role again before performing action
        if (user?.role !== 'admin') {
            toast({
                title: 'Access Denied',
                description: 'Only administrators can perform this action.',
                variant: 'destructive',
            });
            return;
        }

        setIsAddingUser(true);

        try {
            // Validate password
            if (formData.password.length < 8) {
                toast({
                    title: 'Invalid Password',
                    description: 'Password must be at least 8 characters long',
                    variant: 'destructive',
                });
                return;
            }

            await api.signup(
                formData.name,
                formData.email,
                formData.password,
                formData.role as User['role']
            );

            toast({
                title: 'Success',
                description: 'User created successfully',
            });

            // Refresh users list
            const updatedUsers = await api.getAllUsers();
            setUsers(updatedUsers);

            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                role: '',
            });
        } catch (error) {
            console.error('Error creating user:', error);
            toast({
                title: 'Error',
                description: 'Failed to create user',
                variant: 'destructive',
            });
        } finally {
            setIsAddingUser(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        // Verify admin role again before performing action
        if (user?.role !== 'admin') {
            toast({
                title: 'Access Denied',
                description: 'Only administrators can perform this action.',
                variant: 'destructive',
            });
            return;
        }

        try {
            await api.deleteUser(userId);
            toast({
                title: 'Success',
                description: 'User deleted successfully',
            });
            
            // Refresh users list
            const updatedUsers = await api.getAllUsers();
            setUsers(updatedUsers);
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete user',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardContent className="p-6">
                        <p>Loading...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null; // Return null as the useEffect will handle the redirect
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter user's name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter user's email"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Enter password (minimum 8 characters)"
                                    required
                                    minLength={8}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select user role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="firm">Firm</SelectItem>
                                        <SelectItem value="lawyer">Lawyer</SelectItem>
                                        <SelectItem value="legal_researcher">Legal Researcher</SelectItem>
                                        <SelectItem value="judge">Judge</SelectItem>
                                        <SelectItem value="legal_professional">Legal Professional</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full" disabled={isAddingUser}>
                                {isAddingUser ? 'Adding...' : 'Add User'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        System Users
                    </CardTitle>
                    <CardDescription>
                        Manage all users in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="capitalize">{user.role}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}