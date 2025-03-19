'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import * as CaseAPI from '@/lib/api/Case'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, FileText, Users, Scale } from 'lucide-react'

export default function NewCasePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [formData, setFormData] = useState<{
    caseTitle: string;
    caseNumber: string;
    description: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    parties: {
      plaintiff: { name: string; identification: string };
      defendant: { name: string; identification: string };
    };
    documents: never[];
  }>({
    caseTitle: '',
    caseNumber: '',
    description: '',
    status: 'Open',
    parties: {
      plaintiff: { name: '', identification: '' },
      defendant: { name: '', identification: '' },
    },
    documents: [],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePartyChange = (party: 'plaintiff' | 'defendant', field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      parties: {
        ...prev.parties,
        [party]: { ...prev.parties[party], [field]: value },
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) {
      setIsSubmitting(false)
      toast({
        title: 'Error',
        description: 'You must be logged in to create a case.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const newCase = await CaseAPI.createCase({
        ...formData,
        caseOwner: user._id,
      })
      if ('error' in newCase) {
        throw new Error(newCase.error);
      }
      console.log('New case:', newCase)
      toast({ title: 'Case created successfully' })
      router.push('/case-management')
    } catch (error) {
      console.error('Error creating case:', error)
      toast({
        title: 'Error creating case',
        description: 'Failed to create the case. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/case-management')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cases
        </Button>
        <h1 className="text-3xl font-bold text-white">Create New Case</h1>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Case Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="caseTitle" className="text-gray-300">Case Title</Label>
                <Input
                  id="caseTitle"
                  name="caseTitle"
                  value={formData.caseTitle}
                  onChange={handleChange}
                  placeholder="Enter case title"
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseNumber" className="text-gray-300">Case Number</Label>
                <Input
                  id="caseNumber"
                  name="caseNumber"
                  value={formData.caseNumber}
                  onChange={handleChange}
                  placeholder="Enter case number"
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter case description"
                rows={4}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">Status</Label>
                <Select
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as 'Open' | 'In Progress' | 'Resolved' | 'Closed' }))}
                  defaultValue={formData.status}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select case status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Open" className="text-white">Open</SelectItem>
                    <SelectItem value="In Progress" className="text-white">In Progress</SelectItem>
                    <SelectItem value="Closed" className="text-white">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Party Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400">Plaintiff Details</h4>
                  <div className="space-y-2">
                    <Label htmlFor="plaintiffName" className="text-gray-300">Name</Label>
                    <Input
                      id="plaintiffName"
                      value={formData.parties.plaintiff.name}
                      onChange={(e) => handlePartyChange('plaintiff', 'name', e.target.value)}
                      placeholder="Enter plaintiff name"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plaintiffId" className="text-gray-300">Identification</Label>
                    <Input
                      id="plaintiffId"
                      value={formData.parties.plaintiff.identification}
                      onChange={(e) => handlePartyChange('plaintiff', 'identification', e.target.value)}
                      placeholder="Enter plaintiff ID"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400">Defendant Details</h4>
                  <div className="space-y-2">
                    <Label htmlFor="defendantName" className="text-gray-300">Name</Label>
                    <Input
                      id="defendantName"
                      value={formData.parties.defendant.name}
                      onChange={(e) => handlePartyChange('defendant', 'name', e.target.value)}
                      placeholder="Enter defendant name"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defendantId" className="text-gray-300">Identification</Label>
                    <Input
                      id="defendantId"
                      value={formData.parties.defendant.identification}
                      onChange={(e) => handlePartyChange('defendant', 'identification', e.target.value)}
                      placeholder="Enter defendant ID"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-800">
              <Button
                variant="outline"
                onClick={() => router.push('/case-management')}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                {isSubmitting ? 'Creating...' : 'Create Case'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}