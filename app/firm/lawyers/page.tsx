'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import * as CaseAPI from '@/lib/api/Case';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Trash2, Mail, Calendar } from 'lucide-react';
import * as UserAPI from '@/lib/api/User';
import type { User, Case } from '@/types';

interface LawyerWithCases extends User {
  cases?: Case[];
}

export default function LawyersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [lawyers, setLawyers] = useState<LawyerWithCases[]>([]);
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
        setIsLoading(true);
        const casesResponse = await CaseAPI.getCasesByFirm();

        console.log(casesResponse)
        const firmLawyersResponse = await UserAPI.getFirmLawyers();
        const lawyersResponse = 'lawyers' in firmLawyersResponse ? firmLawyersResponse.lawyers : [];
        
        if (Array.isArray(lawyersResponse)) {
          const lawyersWithCases = lawyersResponse.map(lawyer => ({
            ...lawyer,
            cases: Array.isArray(casesResponse) ? casesResponse.filter(c => {
              // Check if the case owner matches the lawyer
              if (typeof c.caseOwner === 'object' && c.caseOwner._id === lawyer._id) {
                return true;
              }
              // Check if the case creator matches the lawyer
              if (typeof c.creator === 'object' && c.creator._id === lawyer._id) {
                return true;
              }
              return false;
            }) : []
          }));
          setLawyers(lawyersWithCases);
        } else {
          console.error('Error fetching lawyers:', lawyersResponse);
          toast({
            title: 'Error',
            description: 'Failed to fetch lawyers. Please try again.',
            variant: 'destructive',
          });
        }
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

    if (!authLoading && user?.role === 'firm') {
      fetchLawyers();
    }
  }, [user, toast]);

  const handleAddLawyer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await UserAPI.registerLawyerThroughFirm(
        newLawyer.name,
        newLawyer.email,
        newLawyer.password
      );

      if ('error' in response) {
        throw new Error(response.error);
      }

      toast({
        title: 'Success',
        description: 'Lawyer added successfully.',
      });

      // Refresh lawyers list
      const updatedLawyers = await UserAPI.getFirmLawyers();
      if (!('error' in updatedLawyers)) {
        setLawyers(updatedLawyers.lawyers);
      }

      // Reset form and close dialog
      setNewLawyer({ name: '', email: '', password: '' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding lawyer:', error);
      toast({
        title: 'Error',
        description: 'Failed to add lawyer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveLawyer = async (lawyerId: string) => {
    try {
      const response = await UserAPI.removeLawyerFromFirm(lawyerId);
      if ('error' in response) {
        throw new Error(response.error);
      }

      toast({
        title: 'Success',
        description: 'Lawyer removed successfully.',
      });

      // Update lawyers list
      setLawyers(lawyers.filter(lawyer => lawyer._id !== lawyerId));
    } catch (error) {
      console.error('Error removing lawyer:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove lawyer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'firm') return null;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Lawyer Management</h1>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Existing Lawyer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Add Existing Lawyer</DialogTitle>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const lawyerId = formData.get('lawyerId') as string;
                
                try {
                  const response = await UserAPI.addExistingLawyerToFirm(lawyerId);
                  if ('error' in response) {
                    throw new Error(response.error);
                  }
                  
                  toast({
                    title: 'Success',
                    description: 'Lawyer added successfully.',
                  });
                  
                  // Refresh lawyers list
                  const updatedLawyers = await UserAPI.getFirmLawyers();
                  if (!('error' in updatedLawyers)) {
                    setLawyers(updatedLawyers.lawyers);
                  }
                } catch (error) {
                  console.error('Error adding existing lawyer:', error);
                  toast({
                    title: 'Error',
                    description: 'Failed to add lawyer. Please try again.',
                    variant: 'destructive',
                  });
                }
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lawyerId" className="text-gray-200">Lawyer ID</Label>
                  <Input
                    id="lawyerId"
                    name="lawyerId"
                    placeholder="Enter lawyer's ID"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                  Add Lawyer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Register New Lawyer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Register New Lawyer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddLawyer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-200">Full Name</Label>
                <Input
                  id="name"
                  value={newLawyer.name}
                  onChange={(e) => setNewLawyer({ ...newLawyer, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newLawyer.email}
                  onChange={(e) => setNewLawyer({ ...newLawyer, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newLawyer.password}
                  onChange={(e) => setNewLawyer({ ...newLawyer, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  Register Lawyer
                </Button>
              </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Firm Lawyers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Active Cases</TableHead>
                  <TableHead className="text-gray-300">Joined Date</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lawyers && lawyers.length > 0 ? lawyers.map((lawyer) => (
                  <TableRow key={lawyer._id} className="border-gray-800">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white">
                          {lawyer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{lawyer.name}</p>
                          <p className="text-sm text-gray-400">ID: {lawyer._id.slice(-6)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{lawyer.email}</TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{lawyer.cases?.filter(c => 
                          c.status === 'Open' || c.status === 'In Progress'
                        ).length || 0}</span>
                        <span className="text-gray-400">active</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(lawyer.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveLawyer(lawyer._id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                      No lawyers found
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