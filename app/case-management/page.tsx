'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import type { Case } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export default function CaseManagementPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    const fetchCases = async () => {
      if (!user) return

      try {
        const fetchedCases = await api.getCases(user._id)
        setCases(fetchedCases)
      } catch (error) {
        console.error('Error fetching cases:', error)
        toast({
          title: 'Error fetching cases',
          description: 'Failed to load cases. Please try again later.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchCases()
    } else if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, toast, router])

  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!user) return null

  return (
    <div className="container mx-auto py-6 md:py-10">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Case Management</CardTitle>
            <Button asChild>
              <Link href="/case-management/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Case
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Client</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.length > 0 ? (
                  cases.map((case_) => (
                    <TableRow key={case_._id}>
                      <TableCell>{case_.caseNumber}</TableCell>
                      <TableCell>{case_.caseTitle}</TableCell>
                      <TableCell className="hidden md:table-cell">{case_.parties?.plaintiff?.name || 'N/A'}</TableCell>
                      <TableCell className="hidden sm:table-cell">{case_.status}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/case-management/${case_._id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No cases found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

