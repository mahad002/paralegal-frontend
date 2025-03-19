'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import * as CaseAPI from '@/lib/api/Case';
import { ArrowLeft, FileText, Edit, Trash2 } from 'lucide-react';
import type { Case } from '@/types';

export default function CaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
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
          const data1 = await CaseAPI.getCaseById(id);
          if ('error' in data1) {
            throw new Error(data1.error);
          }
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
        const updatedCase1 = await CaseAPI.updateCase(id, editedData);
        if ('error' in updatedCase1) {
          throw new Error(updatedCase1.error);
        }
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
        const response = await CaseAPI.deleteCase(id);
        if ('error' in response) {
          throw new Error(response.error);
        }
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
    <div className="container mx-auto p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/case-management')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cases
        </Button>
        <h1 className="text-3xl font-bold text-white">Case Details</h1>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditing ? 'Edit Case' : `Case #${caseData.caseNumber}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="caseTitle" className="text-gray-300">Case Title</Label>
              <Input
                id="caseTitle"
                name="caseTitle"
                value={isEditing ? editedData.caseTitle || '' : caseData.caseTitle}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caseNumber" className="text-gray-300">Case Number</Label>
              <Input
                id="caseNumber"
                name="caseNumber"
                value={isEditing ? editedData.caseNumber || '' : caseData.caseNumber}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={isEditing ? editedData.description || '' : caseData.description || ''}
                onChange={handleChange}
                rows={4}
                disabled={!isEditing}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-300">Status</Label>
              <Select
                onValueChange={handleStatusChange}
                value={isEditing ? editedData.status : caseData.status}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                  <SelectValue placeholder="Select case status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="Open" className="text-white">Open</SelectItem>
                  <SelectItem value="In Progress" className="text-white">In Progress</SelectItem>
                  <SelectItem value="Resolved" className="text-white">Resolved</SelectItem>
                  <SelectItem value="Closed" className="text-white">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-gray-800">
              {isEditing ? (
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handleEditClick}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Case
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeletePopupOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Case
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {isDeletePopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Case</h3>
            <p className="text-gray-400 mb-4">Are you sure you want to delete this case? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsDeletePopupOpen(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCase}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}