'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Search, Upload, Trash2, Eye, LayoutList, LayoutGrid } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import * as CaseNoteAPI from '@/lib/api/CaseNote';
import type { CaseNote } from '@/types';

interface AnalysisResult {
  citations: string[];
  facts: string[];
  statutes: {
    acts: string[];
    sections: string[];
    articles: string[];
  };
  precedents: string[];
  ratio: string[];
  rulings: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paralegal-backend.onrender.com';
const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || 'https://case-note-cretaion-bot.onrender.com';

export default function CaseNotesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTextView, setIsTextView] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;

      try {
        const response = await CaseNoteAPI.getCaseNotes(user._id);
        if ('error' in response) {
          throw new Error(response.error);
        }
        setNotes(response);
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch case notes',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [user, toast]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("file", file);

      // Upload file to S3
      const uploadResponse = await fetch(`${API_URL}/api/s3/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const { links } = await uploadResponse.json();
      const s3Link = links[0];

      // Process the uploaded file
      const processResponse = await fetch(`${BOT_URL}/process-judgment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ s3_link: s3Link }),
      });

      const response = await processResponse.json();
      const result: AnalysisResult = response.processed_data;
      setAnalysisResult(result);
      setRawResponse(JSON.stringify(response, null, 2));

      // Save the analyzed note
      if (user?._id) {
        const noteData = {
          case: user._id, // This should be the actual case ID
          citations: result.citations,
          facts: result.facts,
          statutes: result.statutes,
          precedents: result.precedents,
          ratio: result.ratio,
          rulings: result.rulings,
        };

        const savedNote = await CaseNoteAPI.addCaseNote(user._id, noteData);
        if ('error' in savedNote) {
          throw new Error(savedNote.error);
        }

        setNotes(prev => [...prev, savedNote]);
      }

      toast({
        title: "Analysis complete",
        description: "The case note has been successfully analyzed and saved",
      });
    } catch (error) {
      console.error("Error uploading or analyzing case note:", error);
      toast({
        title: "Operation failed",
        description: "An error occurred during upload or analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      const response = await CaseNoteAPI.deleteCaseNote(noteId);
      if ('error' in response) {
        throw new Error(response.error);
      }

      setNotes(notes.filter(note => note._id !== noteId));
      toast({
        title: 'Success',
        description: 'Case note deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete case note',
        variant: 'destructive',
      });
    }
  };

  const renderSection = (title: string, items: string[] | undefined) => (
    <section>
      <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
      {items && items.length > 0 ? (
        <ul className="list-disc pl-6 space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-gray-300">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No {title.toLowerCase()} found.</p>
      )}
    </section>
  );

  const renderTextView = () => {
    if (!analysisResult) return null;

    return (
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-6">
          {renderSection("Citations", analysisResult.citations)}
          {renderSection("Facts", analysisResult.facts)}
          <section>
            <h2 className="text-2xl font-bold mb-2 text-white">Statutes</h2>
            <div className="space-y-4">
              {renderSection("Acts", analysisResult.statutes?.acts)}
              {renderSection("Sections", analysisResult.statutes?.sections)}
              {renderSection("Articles", analysisResult.statutes?.articles)}
            </div>
          </section>
          {renderSection("Precedents", analysisResult.precedents)}
          {renderSection("Ratio", analysisResult.ratio)}
          {renderSection("Rulings", analysisResult.rulings)}
        </div>
      </ScrollArea>
    );
  };

  const renderTabbedView = () => {
    if (!analysisResult) return null;

    return (
      <Tabs defaultValue="citations">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 mb-4 bg-gray-800">
          {['Citations', 'Facts', 'Statutes', 'Precedents', 'Ratio', 'Rulings', 'Raw Response'].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab.toLowerCase()}
              className="data-[state=active]:bg-gray-700 text-gray-300"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="citations">{renderSection("Citations", analysisResult.citations)}</TabsContent>
        <TabsContent value="facts">{renderSection("Facts", analysisResult.facts)}</TabsContent>
        <TabsContent value="statutes">
          <div className="space-y-4">
            {renderSection("Acts", analysisResult.statutes?.acts)}
            {renderSection("Sections", analysisResult.statutes?.sections)}
            {renderSection("Articles", analysisResult.statutes?.articles)}
          </div>
        </TabsContent>
        <TabsContent value="precedents">{renderSection("Precedents", analysisResult.precedents)}</TabsContent>
        <TabsContent value="ratio">{renderSection("Ratio", analysisResult.ratio)}</TabsContent>
        <TabsContent value="rulings">{renderSection("Rulings", analysisResult.rulings)}</TabsContent>
        <TabsContent value="raw response">
          <ScrollArea className="h-[300px]">
            <pre className="bg-gray-800 p-4 rounded text-gray-300">{rawResponse}</pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">Case Notes</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search case notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'upload')}>
            <TabsList className="bg-gray-800">
              <TabsTrigger value="list" className="data-[state=active]:bg-gray-700">List View</TabsTrigger>
              <TabsTrigger value="upload" className="data-[state=active]:bg-gray-700">Upload & Analyze</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {activeTab === 'list' ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Notes
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage and analyze your case notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">Case</TableHead>
                    <TableHead className="text-gray-300">Citations</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <TableRow key={note._id} className="border-gray-800">
                        <TableCell className="font-medium text-white">
                          {typeof note.case === 'string' ? note.case : note.case.caseTitle}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {note.citations.length} citations
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/case-notes/${note._id}`)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(note._id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                        No case notes yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <span className="text-white">Case Notes Analysis</span>
              <div className="flex items-center space-x-2">
                <LayoutGrid className={`h-4 w-4 ${!isTextView ? 'text-cyan-400' : 'text-gray-400'}`} />
                <Switch
                  id="view-mode"
                  checked={isTextView}
                  onCheckedChange={setIsTextView}
                />
                <LayoutList className={`h-4 w-4 ${isTextView ? 'text-cyan-400' : 'text-gray-400'}`} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload">
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                <span>
                  <Upload className="mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Upload Case File"}
                </span>
              </Button>
            </label>
            {analysisResult && (
              <div className="mt-6">
                {isTextView ? renderTextView() : renderTabbedView()}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}