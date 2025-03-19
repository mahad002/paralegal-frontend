'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSplash } from '@/contexts/SplashContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Scale, Users, FileText, Building2, UserSquare2, Briefcase, Shield, UserCheck } from 'lucide-react';
import * as CaseAPI from '@/lib/api/Case';
import * as UserAPI from '@/lib/api/User';
import type { Case } from '@/types';
import type { User } from '@/types';

interface DashboardMetrics {
  totalCases: number;
  openCases: number;
  resolvedCases: number;
  closedCases: number;
  totalLawyers?: number;
  totalFirms?: number;
  activeLawyers?: number;
  usersByRole?: { name: string; value: number }[];
  casesByStatus: { name: string; value: number }[];
  casesTrend: { month: string; cases: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { isLoading: splashLoading } = useSplash();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Function to calculate metrics
  const calculateMetrics = (cases: Case[], role: string, lawyersList: User[] = []): DashboardMetrics => {
    // Count cases by status
    const statusCounts = cases.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
    // Count total lawyers
    const totalLawyers = lawyersList.length;

    // Calculate user role distribution for admin
    const roleDistribution = lawyersList.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
    // Calculate cases assigned to each lawyer
    const lawyerStats = lawyersList.reduce(
      (acc, lawyer) => {
        const assignedCases = cases.filter(c => c.caseOwner === lawyer._id).length;
        acc.totalAssignedCases += assignedCases;
        acc.caseDistribution.push({ name: lawyer.name, count: assignedCases });
        return acc;
      },
      {
        totalAssignedCases: 0,
        caseDistribution: [],
      }
    );
  
    // Calculate average cases per lawyer
    lawyerStats.averageCasesPerLawyer = totalLawyers > 0 ? (lawyerStats.totalAssignedCases / totalLawyers).toFixed(1) : "0";
  
    // Convert monthly trend to array format
    const monthlyTrend = cases.reduce((acc, c) => {
      const month = new Date(c.createdAt).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
    const casesTrend = Object.entries(monthlyTrend)
      .map(([month, cases]) => ({ month, cases }))
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
  
    // Base metrics
    const baseMetrics = {
      totalCases: cases.length,
      openCases: statusCounts['Open'] || 0,
      resolvedCases: statusCounts['Resolved'] || 0,
      closedCases: statusCounts['Closed'] || 0,
      casesByStatus: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      casesTrend,
    };
  
    // Add lawyer-specific metrics
    if (role === 'admin') {
      return {
        ...baseMetrics,
        totalLawyers,
        totalFirms: lawyersList.filter(l => l.role === 'firm').length,
        activeLawyers: lawyersList.filter(l => l.role === 'lawyer').length,
        usersByRole: Object.entries(roleDistribution).map(([name, value]) => ({ name, value })),
        lawyerStats,
      };
    } else if (role === 'firm') {
      return {
        ...baseMetrics,
        totalLawyers,
        activeLawyers: lawyersList.filter(l => l.role === 'lawyer').length,
        lawyerStats,
      };
    }
  
    return baseMetrics;
  };

  // Ensure user is authenticated, otherwise redirect to login
  useEffect(() => {
  if (!isLoading && !user) {
    router.push('/login');
  }
}, [user, isLoading, router]);

useEffect(() => {
  const fetchCases = async () => {
    if (!user || isLoading) return; // Prevents API calls when user is undefined

    setIsLoadingMetrics(true);

    try {
      let casesResponse: Case[] | { error: string } = [];
      let lawyersResponse: User[] | { error: string } = [];

      switch (user.role) {
        case 'admin':
          casesResponse = await CaseAPI.getAllCases();
          lawyersResponse = await UserAPI.getAllUsers();
          break;
        case 'firm':
          casesResponse = await CaseAPI.getCasesByFirm();
          lawyersResponse = await UserAPI.getFirmLawyers();
          break;
        default:
          casesResponse = await CaseAPI.getCasesByUser(user._id);
      }

      if (!Array.isArray(casesResponse)) {
        console.error('Invalid cases response:', casesResponse);
        setMetrics(null);
        return;
      }

      let lawyers: User[] = [];
      if (Array.isArray(lawyersResponse)) {
        lawyers = lawyersResponse;
      }
      const calculatedMetrics = calculateMetrics(casesResponse, user.role, lawyers || []);
      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error fetching cases:', error);
      setMetrics(null);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  if (user && !isLoading) {
    fetchCases();
  }
}, [user, isLoading]);

  // Don't render anything while splash screen is showing
  if (splashLoading) {
    return null;
  }

  if (isLoadingMetrics || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="p-6 bg-gray-800 rounded-lg text-center max-w-md">
            <FileText className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Cases Yet</h2>
            <p className="text-gray-400 mb-4">
              Start by creating your first case to see metrics and analytics here.
            </p>
            <Button
              onClick={() => router.push('/case-management/new')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Create Your First Case
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: user.role === 'admin' ? 'Total Cases' : 'Associated Lawyers',
            value: user.role === 'admin' ? metrics.totalCases : metrics.totalLawyers,
            subtext: user.role === 'admin' ? `${((metrics.openCases / metrics.totalCases) * 100).toFixed(1)}% Active` : `${metrics.activeLawyers} Active`,
            icon: user.role === 'admin' ? <Briefcase className="text-blue-400" /> : <Users className="text-blue-400" />,
            bgColor: 'bg-gradient-to-br from-blue-900 to-blue-800',
            textColor: 'text-blue-400'
          },
          { 
            label: user.role === 'admin' ? 'Total Users' : 'Assigned Cases',
            value: user.role === 'admin' ? metrics.totalLawyers : metrics.totalCases,
            subtext: user.role === 'admin' ? `${metrics.activeLawyers} Active` : `${metrics.openCases} Active`,
            icon: user.role === 'admin' ? <Users className="text-emerald-400" /> : <Briefcase className="text-emerald-400" />,
            bgColor: 'bg-gradient-to-br from-emerald-900 to-emerald-800',
            textColor: 'text-emerald-400'
          },
          { 
            label: user.role === 'admin' ? 'Active Firms' : 'Running Cases',
            value: user.role === 'admin' ? metrics.totalFirms : metrics.openCases,
            icon: <Activity className="text-purple-400" />, 
            bgColor: 'bg-gradient-to-br from-purple-900 to-purple-800',
            textColor: 'text-purple-400',
            subtext: user.role === 'admin' ? 'Registered Companies' : `${((metrics.openCases / metrics.totalCases) * 100).toFixed(1)}% of Total`
          },
          { 
            label: user.role === 'admin' ? 'System Health' : 'Completed Cases',
            value: user.role === 'admin' ? '100%' : metrics.resolvedCases + metrics.closedCases,
            icon: <UserCheck className="text-amber-400" />, 
            bgColor: 'bg-gradient-to-br from-amber-900 to-amber-800',
            textColor: 'text-amber-400',
            subtext: user.role === 'admin' ? 'All Systems Operational' : `${(((metrics.resolvedCases + metrics.closedCases) / metrics.totalCases) * 100).toFixed(1)}% Success Rate`
          },
        ].map(({ label, value, subtext, icon, bgColor, textColor }, index) => (
          <Card key={index} className={`${bgColor} border-0 shadow-xl`}>
            <CardContent className="p-6 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-medium ${textColor}`}>{label}</p>
                  <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
                  <p className="text-sm text-gray-300 mt-1">{subtext}</p>
                </div>
                <div className="p-2 rounded-full bg-white/5">
                  {icon}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent opacity-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {user.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-indigo-900 to-indigo-800 border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-300 text-sm">Legal Professionals</p>
                  <h3 className="text-2xl font-bold text-white mt-2">
                    {metrics.usersByRole?.find(r => r.name === 'legal_professional')?.value || 0}
                  </h3>
                </div>
                <Shield className="h-8 w-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-300 text-sm">Active Lawyers</p>
                  <h3 className="text-2xl font-bold text-white mt-2">
                    {metrics.usersByRole?.find(r => r.name === 'lawyer')?.value || 0}
                  </h3>
                </div>
                <UserSquare2 className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900 to-amber-800 border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-300 text-sm">Registered Firms</p>
                  <h3 className="text-2xl font-bold text-white mt-2">
                    {metrics.usersByRole?.find(r => r.name === 'firm')?.value || 0}
                  </h3>
                </div>
                <Building2 className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">
              {user.role === 'admin' ? 'System Activity Trend' : 'Cases Trend'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {user.role === 'admin' ? 'Monthly system usage statistics' : 'Monthly case distribution'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.casesTrend}>
                <XAxis dataKey="month" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip />
                <Bar dataKey="cases" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">
              {user.role === 'admin' ? 'User Role Distribution' : 'Cases by Status'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {user.role === 'admin' ? 'Distribution of users across different roles' : 'Current case status breakdown'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={user.role === 'admin' ? metrics.usersByRole : metrics.casesByStatus} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  fill="#8884d8" 
                  dataKey="value"
                >
                  {(user.role === 'admin' ? (metrics.usersByRole || []) : (metrics.casesByStatus || [])).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {user.role === 'admin' && metrics.usersByRole && (
        <>
        <div className="mt-6">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">User Distribution by Role</CardTitle>
              <CardDescription className="text-gray-400">
                Overview of user roles across the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-300">Count</TableHead>
                      <TableHead className="text-gray-300">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.usersByRole.map((role) => (
                      <TableRow key={role.name} className="border-gray-800">
                        <TableCell className="font-medium text-white capitalize">
                          {role.name.replace('_', ' ')}
                        </TableCell>
                        <TableCell className="text-gray-300">{role.value}</TableCell>
                        <TableCell className="text-gray-300">
                          {((role.value / metrics.totalLawyers!) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Lawyer Performance Details</CardTitle>
                <CardDescription className="text-gray-400">
                  Detailed metrics for each associated lawyer
                </CardDescription>
              </div>
              <Button
                onClick={() => router.push('/firm/lawyers')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                Manage Lawyers
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-300">Lawyer</TableHead>
                      <TableHead className="text-gray-300">Active Cases</TableHead>
                      <TableHead className="text-gray-300">Completed Cases</TableHead>
                      <TableHead className="text-gray-300">Success Rate</TableHead>
                      <TableHead className="text-gray-300">Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(metrics.lawyerStats?.caseDistribution || []).map((lawyer) => (
                      <TableRow key={lawyer.name} className="border-gray-800">
                        <TableCell className="font-medium text-white">
                          {lawyer.name}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {lawyer.count}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {metrics.lawyerStats?.completionRates?.find(l => l.name === lawyer.name)?.rate || 0}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-800 rounded-full h-2 mr-2">
                              <div
                                className="bg-cyan-400 h-2 rounded-full"
                                style={{
                                  width: `${metrics.lawyerStats?.completionRates?.find(l => l.name === lawyer.name)?.rate || 0}%`
                                }}
                              />
                            </div>
                            <span>
                              {metrics.lawyerStats?.completionRates?.find(l => l.name === lawyer.name)?.rate || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date().toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        </>
      )}
    </div>
  );
}