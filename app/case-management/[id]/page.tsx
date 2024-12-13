'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import type { Case } from '@/types';

export default function CaseDetailPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Case>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCase = async () => {
      let data;
      try {
        if (typeof id === 'string') {
          const data1 = await api.getCase(id);
          data = data1;
        } else {
          throw new Error('Invalid case ID');
        }

        setCaseData(data);
        setEditedData(data);
      } catch (error) {
        console.error('Error fetching case:', error);
        toast({ title: 'Error fetching case', description: 'Could not load case details.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCase();
  }, [id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: 'Open' | 'In Progress' | 'Resolved' | 'Closed') => {
    setEditedData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let updatedCase;
    try {
      if (typeof id === 'string') {
        const updatedCase1 = await api.updateCase(id, editedData);
        updatedCase = updatedCase1;
        setCaseData(updatedCase);
        setIsEditing(false);
        toast({ title: 'Case updated successfully' });
      } else {
        throw new Error('Invalid case ID');
      }
      setCaseData(updatedCase);
      setIsEditing(false);
      toast({ title: 'Case updated successfully' });
    } catch (error) {
      console.error('Error updating case:', error);
      toast({ title: 'Error updating case', description: 'Failed to update the case.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCase = async () => {
    try {
      if (typeof id === 'string') {
        await api.deleteCase(id);
      } else {
        throw new Error('Invalid case ID');
      }
      toast({ title: 'Case deleted successfully' });
      window.location.href = '/case-management';
    } catch (error) {
      console.error('Error deleting case:', error);
      toast({ title: 'Error deleting case', description: 'Failed to delete the case.', variant: 'destructive' });
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedData(caseData || {});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(caseData || {});
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!caseData) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent>
            <p>Case not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Case' : 'Case Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="caseTitle">Case Title</Label>
              <Input
                id="caseTitle"
                name="caseTitle"
                value={isEditing ? editedData.caseTitle || '' : caseData.caseTitle}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                name="caseNumber"
                value={isEditing ? editedData.caseNumber || '' : caseData.caseNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={isEditing ? editedData.description || '' : caseData.description || ''}
                onChange={handleChange}
                rows={4}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={handleStatusChange}
                value={isEditing ? editedData.status : caseData.status}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between items-center">
              {isEditing ? (
                <div className="flex space-x-4">
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <Button type="button" onClick={handleEditClick}>
                  Edit Case
                </Button>
              )}
              <Button type="button" variant="destructive" onClick={() => setIsDeletePopupOpen(true)}>
                Delete Case
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {isDeletePopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="mb-4">Are you sure you want to delete this case?</p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsDeletePopupOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCase}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
