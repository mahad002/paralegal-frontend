'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

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
      toast({
        title: 'Error',
        description: 'You must be logged in to create a case.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const newCase = await api.createCase({
        ...formData,
        caseOwner: user._id,
      })
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
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Case</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="caseTitle">Case Title</Label>
              <Input
                id="caseTitle"
                name="caseTitle"
                value={formData.caseTitle}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                name="caseNumber"
                value={formData.caseNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as 'Open' | 'In Progress' | 'Resolved' | 'Closed' }))}
                defaultValue={formData.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plaintiffName">Plaintiff Name</Label>
              <Input
                id="plaintiffName"
                value={formData.parties.plaintiff.name}
                onChange={(e) => handlePartyChange('plaintiff', 'name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plaintiffId">Plaintiff Identification</Label>
              <Input
                id="plaintiffId"
                value={formData.parties.plaintiff.identification}
                onChange={(e) => handlePartyChange('plaintiff', 'identification', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defendantName">Defendant Name</Label>
              <Input
                id="defendantName"
                value={formData.parties.defendant.name}
                onChange={(e) => handlePartyChange('defendant', 'name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defendantId">Defendant Identification</Label>
              <Input
                id="defendantId"
                value={formData.parties.defendant.identification}
                onChange={(e) => handlePartyChange('defendant', 'identification', e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => router.push('/case-management')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Case'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

