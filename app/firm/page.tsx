'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, FileText, Building2, UserSquare2, Briefcase, Scale, UserCheck, Award, TrendingUp, Clock } from 'lucide-react';
import * as CaseAPI from '@/lib/api/Case';
import * as UserAPI from '@/lib/api/User';
import type { Case, User } from '@/types';

interface DashboardMetrics {
  totalCases: number;
  openCases: number;
  resolvedCases: number;
  closedCases: number;
  totalLawyers: number;
  activeLawyers: number;
  lawyerStats: {
    highestCaseload: { name: string; count: number };
    bestPerformer: { name: string; rate: number };
    recentlyActive: { name: string; lastActivity: string };
    totalAssignedCases: number;
    averageCasesPerLawyer: number;
    mostActiveLawyer: { name: string; cases: number };
    completionRates: { name: string; rate: number }[];
    caseDistribution: { name: string; count: number }[];
  };
  casesByStatus: { name: string; value: number }[];
  casesTrend: { month: string; cases: number }[];
  lawyerPerformance: { name: string; cases: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function FirmDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'firm')) {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== 'firm') return;

      try {
        setIsLoading(true);
        const [casesResponse, lawyersResponse] = await Promise.all([
          CaseAPI.getCasesByFirm(),
          UserAPI.getFirmLawyers()
        ]);

        if ('error' in casesResponse || 'error' in lawyersResponse) {
          throw new Error('Failed to fetch data');
        }

        const cases = Array.isArray(casesResponse) ? casesResponse : [];
        const lawyers = Array.isArray(lawyersResponse.lawyers) ? lawyersResponse.lawyers : [];

        // Enhanced lawyer statistics
        const lawyerMetrics = lawyers.map(lawyer => {
          const lawyerCases = cases.filter(c => c.assignedLawyer === lawyer._id);
          const activeCases = lawyerCases.filter(c => c.status === 'Open' || c.status === 'In Progress');
          const completedCases = lawyerCases.filter(c => c.status === 'Resolved' || c.status === 'Closed');
          const lastActivity = lawyerCases.length ?
            lawyerCases
              .map(c => new Date(c.updatedAt || c.createdAt))
              .reduce((latest, current) => (current > latest ? current : latest))
              .toISOString() :
            null;

          return {
            name: lawyer.name,
            id: lawyer._id,
            totalCases: lawyerCases.length,
            activeCases: activeCases.length,
            completedCases: completedCases.length,
            completionRate: lawyerCases.length ? (completedCases.length / lawyerCases.length) * 100 : 0,
            lastActivity
          };
        });

        // Find top performers
        const highestCaseload = lawyerMetrics.reduce((max, curr) => 
          (curr.activeCases || 0) > (max.count || 0) ? { name: curr.name, count: curr.activeCases || 0 } : max,
          { name: '', count: 0 }
        );

        const bestPerformer = lawyerMetrics.reduce((max, curr) => 
          (curr.completionRate || 0) > (max.rate || 0) ? { name: curr.name, rate: curr.completionRate || 0 } : max,
          { name: '', rate: 0 }
        );

        const recentlyActive = lawyerMetrics.reduce((latest, curr) => 
          curr.lastActivity && (!latest.lastActivity || curr.lastActivity > latest.lastActivity) ?
            { name: curr.name, lastActivity: curr.lastActivity.toString() } :
            latest,
          { name: '', lastActivity: '' }
        );

        // Calculate detailed lawyer statistics
        const lawyerStats = lawyers.map(lawyer => {
          const lawyerCases = cases.filter(c => c.assignedLawyer === lawyer._id);
          const completedCases = lawyerCases.filter(c => c.status === 'Resolved' || c.status === 'Closed');
          return {
            name: lawyer.name,
            totalCases: lawyerCases.length,
            completedCases: completedCases.length,
            activeCases: lawyerCases.filter(c => c.status === 'Open').length,
            completionRate: lawyerCases.length ? (completedCases.length / lawyerCases.length) * 100 : 0
          };
        });

        const totalAssignedCases = lawyerStats.reduce((sum, l) => sum + l.totalCases, 0);
        const averageCasesPerLawyer = lawyers.length ? 
          Math.round((totalAssignedCases / lawyers.length) * 10) / 10 : 0;
        const mostActiveLawyer = lawyerStats.reduce((max, curr) => 
          (curr.totalCases || 0) > (max.cases || 0) ? { name: curr.name, cases: curr.totalCases || 0 } : max, 
          { name: '', cases: 0 }
        );

        // Calculate metrics
        const statusCounts = cases.reduce((acc, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const monthlyTrend = cases.reduce((acc, c) => {
          const month = new Date(c.createdAt).toLocaleString('default', { month: 'short' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Calculate lawyer performance
        const lawyerCases = lawyers.map(lawyer => ({
          name: lawyer.name,
          cases: cases.filter(c => c.assignedLawyer === lawyer._id).length
        }));

        setMetrics({
          totalCases: cases.length,
          openCases: statusCounts['Open'] || 0,
          resolvedCases: statusCounts['Resolved'] || 0,
          closedCases: statusCounts['Closed'] || 0,
          totalLawyers: lawyers.length,
          activeLawyers: lawyers.filter(l => l.role === 'lawyer').length,
          lawyerStats: {
            highestCaseload,
            bestPerformer,
            recentlyActive,
            totalAssignedCases,
            averageCasesPerLawyer,
            mostActiveLawyer,
            completionRates: lawyerStats.map(l => ({
              name: l.name,
              rate: Math.round(l.completionRate * 10) / 10
            })),
            caseDistribution: lawyerStats.map(l => ({
              name: l.name,
              count: l.activeCases
            }))
          },
          casesByStatus: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
          casesTrend: Object.entries(monthlyTrend).map(([month, cases]) => ({ month, cases })),
          lawyerPerformance: lawyerCases
        });
      } catch (error) {
        console.error('Error fetching firm data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="p-6 bg-gray-800 rounded-lg text-center max-w-md">
            <Building2 className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Data Available</h2>
            <p className="text-gray-400 mb-4">
              Start by adding lawyers to your firm and managing cases.
            </p>
            <Button
              onClick={() => router.push('/firm/lawyers')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              style={{ color: 'white' }}
            >
              Manage Lawyers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white">Firm Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Total Lawyers</p>
                <h3 className="text-2xl font-bold text-white mt-2">{metrics.totalLawyers}</h3>
                <p className="text-sm text-blue-200 mt-1">{metrics.activeLawyers} Active</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-300 text-sm">Total Cases</p>
                <h3 className="text-2xl font-bold text-white mt-2">{metrics.totalCases}</h3>
                <p className="text-sm text-emerald-200 mt-1">
                  {metrics.lawyerStats.averageCasesPerLawyer} Avg/Lawyer
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Active Cases</p>
                <h3 className="text-2xl font-bold text-white mt-2">{metrics.openCases}</h3>
                <p className="text-sm text-purple-200 mt-1">
                  {((metrics.openCases / metrics.totalCases) * 100).toFixed(1)}% of Total
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900 to-amber-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-300 text-sm">Resolved Cases</p>
                <h3 className="text-2xl font-bold text-white mt-2">{metrics.resolvedCases}</h3>
                <p className="text-sm text-amber-200 mt-1">
                  {((metrics.resolvedCases / metrics.totalCases) * 100).toFixed(1)}% Success Rate
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="bg-gradient-to-br from-indigo-900 to-indigo-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="h-8 w-8 text-indigo-400" />
              <p className="text-indigo-300 text-sm">Best Performer</p>
            </div>
            <h3 className="text-xl font-bold text-white">{metrics.lawyerStats.bestPerformer.name}</h3>
            <p className="text-sm text-indigo-200 mt-1">
              {metrics.lawyerStats.bestPerformer.rate.toFixed(1)}% Completion Rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900 to-cyan-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-cyan-400" />
              <p className="text-cyan-300 text-sm">Highest Caseload</p>
            </div>
            <h3 className="text-xl font-bold text-white">{metrics.lawyerStats.highestCaseload.name}</h3>
            <p className="text-sm text-cyan-200 mt-1">
              {metrics.lawyerStats.highestCaseload.count} Active Cases
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-900 to-rose-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-rose-400" />
              <p className="text-rose-300 text-sm">Recently Active</p>
            </div>
            <h3 className="text-xl font-bold text-white">{metrics.lawyerStats.recentlyActive.name}</h3>
            <p className="text-sm text-rose-200 mt-1">
              {metrics.lawyerStats.recentlyActive.lastActivity ? 
                new Date(metrics.lawyerStats.recentlyActive.lastActivity).toLocaleDateString() :
                'No recent activity'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {[
          { 
            label: 'Associated Lawyers',
            value: metrics.totalLawyers,
            subtext: `${metrics.activeLawyers} Active`,
            icon: <Users className="text-blue-400" />,
            bgColor: 'bg-gradient-to-br from-blue-900 to-blue-800',
            textColor: 'text-blue-400'
          },
          { 
            label: 'Assigned Cases',
            value: metrics.lawyerStats.totalAssignedCases,
            subtext: `${metrics.lawyerStats.averageCasesPerLawyer} Avg/Lawyer`,
            icon: <Briefcase className="text-emerald-400" />,
            bgColor: 'bg-gradient-to-br from-emerald-900 to-emerald-800',
            textColor: 'text-emerald-400'
          },
          { 
            label: 'Open Cases', 
            value: metrics.openCases, 
            icon: <Activity className="text-purple-400" />, 
            bgColor: 'bg-gradient-to-br from-purple-900 to-purple-800',
            textColor: 'text-purple-400',
            subtext: `${((metrics.openCases / metrics.totalCases) * 100).toFixed(1)}% of Total`
          },
          { 
            label: 'Resolved Cases', 
            value: metrics.resolvedCases, 
            icon: <UserCheck className="text-amber-400" />, 
            bgColor: 'bg-gradient-to-br from-amber-900 to-amber-800',
            textColor: 'text-amber-400',
            subtext: `${((metrics.resolvedCases / metrics.totalCases) * 100).toFixed(1)}% of Total`
          },
        ].map(({ label, value, subtext, icon, bgColor, textColor }, index) => (
          <Card key={index} className={`${bgColor} border-0 shadow-xl`}>
            <CardContent className="p-6 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-medium ${textColor}`}>{label}</p>
                  <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
                  {subtext && (
                    <p className="text-sm text-gray-300 mt-1">{subtext}</p>
                  )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Cases Trend</CardTitle>
            <CardDescription className="text-gray-400">
              Monthly case distribution over time
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

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Cases by Status</CardTitle>
            <CardDescription className="text-gray-400">
              Distribution of cases across different statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.casesByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.casesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Lawyer Performance</CardTitle>
          <CardDescription className="text-gray-400">
            Detailed performance metrics for each lawyer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">Lawyer Name</TableHead>
                <TableHead className="text-gray-300">Cases Handled</TableHead>
                <TableHead className="text-gray-300">Performance Score</TableHead>
                <TableHead className="text-gray-300">Active Cases</TableHead>
                <TableHead className="text-gray-300">Success Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.lawyerPerformance.map((lawyer, index) => (
                <TableRow key={index} className="border-gray-800">
                  <TableCell className="font-medium text-white">{lawyer.name}</TableCell>
                  <TableCell className="text-gray-300">{lawyer.cases}</TableCell>
                  <TableCell className="text-gray-300">
                    {lawyer.cases > 0 ? `${((lawyer.cases / metrics.totalCases) * 100).toFixed(1)}%` : '0%'}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {metrics.lawyerStats.caseDistribution.find(l => l.name === lawyer.name)?.count || 0}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {metrics.lawyerStats.completionRates.find(l => l.name === lawyer.name)?.rate || 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}