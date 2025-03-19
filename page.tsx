'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PlusCircle, Search, Filter, LayoutGrid, LayoutList, FileText, Clock, Tag, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import * as CaseAPI from '@/lib/api/Case';
import type { Case } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const statusColors = {
  'Open': 'bg-emerald-500/10 text-emerald-500',
  'In Progress': 'bg-blue-500/10 text-blue-500',
  'Resolved': 'bg-purple-500/10 text-purple-500',
  'Closed': 'bg-gray-500/10 text-gray-400'
};

export default function CaseManagementPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchCases = async () => {
      if (!user) return;

      try {
        const fetchedCases = await CaseAPI.getCasesByUser(user._id);
        if ('error' in fetchedCases) {
          throw new Error(fetchedCases.error);
        }
        setCases(fetchedCases);
      } catch (error) {
        console.error('Error fetching cases:', error);
        toast({
          title: 'Error fetching cases',
          description: 'Failed to load cases. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchCases();
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, toast, router]);

  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">Case Management</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('list')}
              className={`border-gray-700 ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`border-gray-700 ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cases
            </CardTitle>
            <Button
              onClick={() => router.push('/case-management/new')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Case
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">Case Details</TableHead>
                    <TableHead className="text-gray-300">Client</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Last Updated</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.length > 0 ? (
                    cases
                      .filter(c => 
                        (statusFilter === 'all' || c.status === statusFilter) &&
                        (c.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((case_) => (
                        <TableRow key={case_._id} className="border-gray-800">
                          <TableCell>
                            <div>
                              <p className="font-medium text-white">{case_.caseTitle}</p>
                              <p className="text-sm text-gray-400">#{case_.caseNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-white">{case_.parties?.plaintiff?.name || 'N/A'}</p>
                              <p className="text-sm text-gray-400">{case_.parties?.plaintiff?.identification || 'No ID'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[case_.status]}>
                              {case_.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-gray-400" />
                              {new Date(case_.updatedAt || case_.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/case-management/${case_._id}`)}
                              className="text-gray-400 hover:text-white"
                            >
                              View Details
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                        No cases found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases
                .filter(c => 
                  (statusFilter === 'all' || c.status === statusFilter) &&
                  (c.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((case_) => (
                  <Card
                    key={case_._id}
                    className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                    onClick={() => router.push(`/case-management/${case_._id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-white mb-1">{case_.caseTitle}</h3>
                          <p className="text-sm text-gray-400">#{case_.caseNumber}</p>
                        </div>
                        <Badge className={statusColors[case_.status]}>
                          {case_.status}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Client</p>
                          <p className="text-white">{case_.parties?.plaintiff?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Last Updated</p>
                          <p className="text-white">
                            {new Date(case_.updatedAt || case_.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {case_.description && (
                          <div>
                            <p className="text-sm text-gray-400">Description</p>
                            <p className="text-white line-clamp-2">{case_.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}