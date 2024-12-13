'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bot, FileText, FolderOpen, PlusCircle, LogIn, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
// import { Case, User, CaseNote } from '@/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, LineChart, Line, Legend, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [activeCases, setActiveCases] = useState<number | null>(null)
  const [totalCases, setTotalCases] = useState<number | null>(null)
  const [recentNotesCount, setRecentNotesCount] = useState<number | null>(null)
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [caseStatusData, setCaseStatusData] = useState<{ name: string; value: number }[]>([])
  const [userCaseStatusData, setUserCaseStatusData] = useState<{ name: string; value: number }[]>([])
  const [averageCaseAge, setAverageCaseAge] = useState<number | null>(null)
  const [userRoleData, setUserRoleData] = useState<{ name: string; value: number }[]>([])
  const [caseActivityData, setCaseActivityData] = useState<{ date: string; count: number }[]>([])
  const [casesAndUsersData, setCasesAndUsersData] = useState<{ name: string; Cases: number; Users: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setIsLoading(false)
      return
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        if (!user._id) {
          throw new Error('User ID is missing')
        }

        // Fetch cases count
        const { activeCases, recentNotesCount } = await api.getCasesCount(user._id)
        setActiveCases(activeCases)
        setRecentNotesCount(recentNotesCount)

        // Fetch all users
        const users = await api.getAllUsers()
        setTotalUsers(users.length)

        // Calculate user role distribution
        const roleCounts = users.reduce((acc, u) => {
          acc[u.role] = (acc[u.role] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        setUserRoleData(Object.entries(roleCounts).map(([name, value]) => ({ name, value })))

        // Fetch all cases (not just for the current user)
        const allCases = await api.getAllCases()
        setTotalCases(allCases.length)

        // Fetch user's cases
        const userCases = await api.getCases(user._id)

        // Calculate case status data for all cases
        const allStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
        const statusCounts = allCases.reduce((acc, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const caseStatusData = allStatuses.map(status => ({
          name: status,
          value: statusCounts[status] || 0
        }));
        setCaseStatusData(caseStatusData);

        // Calculate case status data for user's cases
        const userStatusCounts = userCases.reduce((acc, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const userCaseStatusData = allStatuses.map(status => ({
          name: status,
          value: userStatusCounts[status] || 0
        }));
        setUserCaseStatusData(userCaseStatusData);

        // Update other calculations that use 'cases'
        if (allCases.length > 0) {
          // Calculate average case age
          const now = new Date()
          const totalAge = allCases.reduce((sum, c) => {
            const caseDate = new Date(c.createdAt)
            return sum + (now.getTime() - caseDate.getTime())
          }, 0)
          setAverageCaseAge(Math.round(totalAge / (allCases.length * 24 * 60 * 60 * 1000))) // Convert to days

          // Calculate case activity over time (last 30 days)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const activityData = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(thirtyDaysAgo)
            date.setDate(date.getDate() + i)
            return {
              date: date.toISOString().split('T')[0],
              count: 0
            }
          })
          allCases.forEach(c => {
            const caseDate = new Date(c.createdAt).toISOString().split('T')[0]
            const dataPoint = activityData.find(d => d.date === caseDate)
            if (dataPoint) {
              dataPoint.count++
            }
          })
          setCaseActivityData(activityData)
        } else {
          setAverageCaseAge(0)
          setCaseActivityData([])
        }

        // Set data for cases and users bar chart
        setCasesAndUsersData([
          { name: 'Total', Cases: allCases.length, Users: users.length }
        ])

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please try again later.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, authLoading, toast])

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
        <Button asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Active Cases */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Case-Management</CardTitle>
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold pl-2">{activeCases !== null ? activeCases : 'N/A'}</div>
            <p className="text-xs text-muted-foreground pl-2">Total active cases</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/case-management">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Case
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Total Cases */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium ">Total Cases</CardTitle>
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold pl-2">{totalCases !== null ? totalCases : 'N/A'}</div>
            <p className="text-xs text-muted-foreground pl-2">All cases in the system</p>
          </CardContent>
        </Card>

        {/* Recent Case Notes */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recent Case Notes</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold pl-2">{recentNotesCount !== null ? recentNotesCount : 'N/A'}</div>
            <p className="text-xs text-muted-foreground pl-2">Notes from the most recent case</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/case-notes">View All Notes</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Compliance Check */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Compliance Check</CardTitle>
            <Bot className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold pl-2">Compliance Check</div>
            <p className="text-xs text-muted-foreground pl-2">Ensure legal and regulatory compliance</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/compliance-bot">Run Compliance Check</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Total Users */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold pl-2">{totalUsers !== null ? totalUsers : 'N/A'}</div>
            <p className="text-xs text-muted-foreground pl-2">Registered users in the system</p>
          </CardContent>
        </Card>

        {/* Average Case Age */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Case Age</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold pl-2">{averageCaseAge !== null ? `${averageCaseAge} days` : 'N/A'}</div>
            <p className="text-xs text-muted-foreground pl-2">Average time cases remain open</p>
          </CardContent>
        </Card>

        {/* Total Cases and Users */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Total Cases and Users</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={casesAndUsersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Cases" fill="#8884d8" />
                <Bar dataKey="Users" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Global Case Status Distribution */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Global Case Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] p-4">
            <ChartContainer
              config={{
                value: {
                  label: "Number of Cases",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caseStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="value">
                    {caseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User's Case Status Distribution */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Your Case Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] p-4">
            <ChartContainer
              config={{
                value: {
                  label: "Number of Cases",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userCaseStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="value">
                    {userCaseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Case Activity Over Time */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Case Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={caseActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

