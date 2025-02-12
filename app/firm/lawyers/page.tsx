'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import type { User } from '@/types';
import { Trash2, UserPlus, Users } from 'lucide-react';

export default function FirmLawyersPage() {
    const [lawyers, setLawyers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingLawyer, setIsAddingLawyer] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchLawyers = async () => {
        try {
            const fetchedLawyers = await api.getFirmLawyers();
            setLawyers(fetchedLawyers);
        } catch (error) {
            console.error('Error fetching lawyers:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch lawyers',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'firm') {
            fetchLawyers();
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingLawyer(true);

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

            await api.addLawyerToFirm({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            toast({
                title: 'Success',
                description: 'Lawyer added successfully',
            });

            // Refresh lawyers list
            await fetchLawyers();

            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
            });
        } catch (error) {
            console.error('Error creating lawyer:', error);
            toast({
                title: 'Error',
                description: 'Failed to add lawyer',
                variant: 'destructive',
            });
        } finally {
            setIsAddingLawyer(false);
        }
    };

    const handleRemoveLawyer = async (lawyerId: string) => {
        try {
            await api.removeLawyerFromFirm(lawyerId);
            toast({
                title: 'Success',
                description: 'Lawyer removed successfully',
            });
            await fetchLawyers();
        } catch (error) {
            console.error('Error removing lawyer:', error);
            toast({
                title: 'Error',
                description: 'Failed to remove lawyer',
                variant: 'destructive',
            });
        }
    };

    if (user?.role !== 'firm') {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardContent className="p-6">
                        <p>You do not have permission to access this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

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

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Lawyer Management</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New Lawyer
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Lawyer</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter lawyer's name"
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
                                    placeholder="Enter lawyer's email"
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
                            <Button type="submit" className="w-full" disabled={isAddingLawyer}>
                                {isAddingLawyer ? 'Adding...' : 'Add Lawyer'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Firm Lawyers
                    </CardTitle>
                    <CardDescription>
                        Manage the lawyers associated with your firm
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lawyers.length > 0 ? (
                                lawyers.map((lawyer) => (
                                    <TableRow key={lawyer._id}>
                                        <TableCell className="font-medium">{lawyer.name}</TableCell>
                                        <TableCell>{lawyer.email}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRemoveLawyer(lawyer._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No lawyers found
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