'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit, Trash2, ArrowLeft, Book, Scale, Gavel, FileText, LayoutList, LayoutGrid } from 'lucide-react';
import * as CaseNoteAPI from '@/lib/api/CaseNote';
import type { CaseNote } from '@/types';

export default function CaseNoteDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [note, setNote] = useState<CaseNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTextView, setIsTextView] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (typeof id !== 'string') return;

      try {
        const response = await CaseNoteAPI.getCaseNoteById(id);
        if ('error' in response) {
          throw new Error(response.error);
        }
        setNote(response);
      } catch (error) {
        console.error('Error fetching note:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch case note',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [id, toast]);

  const handleDelete = async () => {
    if (!note?._id) return;

    try {
      const response = await CaseNoteAPI.deleteCaseNote(note._id);
      if ('error' in response) {
        throw new Error(response.error);
      }

      toast({
        title: 'Success',
        description: 'Case note deleted successfully',
      });
      router.push('/case-notes');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete case note',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!note) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <p className="text-white">Case note not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/case-notes')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Case Notes
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push(`/case-notes/${note._id}/edit`)}
            className="text-gray-400 hover:text-white"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl">
                Case Note #{note._id.slice(-6)}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Created on {new Date(note.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-gray-800 text-cyan-400">
              Case #{typeof note.case === 'string' ? note.case : note.case.caseNumber}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Analysis Results</CardTitle>
            <div className="flex items-center space-x-2">
              <LayoutGrid className={`h-4 w-4 ${!isTextView ? 'text-cyan-400' : 'text-gray-400'}`} />
              <Switch
                checked={isTextView}
                onCheckedChange={setIsTextView}
              />
              <LayoutList className={`h-4 w-4 ${isTextView ? 'text-cyan-400' : 'text-gray-400'}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isTextView ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-bold text-white mb-4">Citations</h2>
                  <div className="space-y-3">
                    {note.citations.map((citation, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-white">{citation}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-4">Facts</h2>
                  <div className="space-y-3">
                    {note.facts.map((fact, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-white">{fact}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-4">Statutes</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Acts</h3>
                      <div className="space-y-2">
                        {note.statutes.acts.length > 0 ? (
                          note.statutes.acts.map((act, index) => (
                            <div key={index} className="p-3 bg-gray-800 rounded-lg">
                              <p className="text-white">{act}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-gray-800/50 rounded-lg text-gray-400">No acts found</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Sections</h3>
                      <div className="space-y-2">
                        {note.statutes.sections.length > 0 ? (
                          note.statutes.sections.map((section, index) => (
                            <div key={index} className="p-3 bg-gray-800 rounded-lg">
                              <p className="text-white">{section}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-gray-800/50 rounded-lg text-gray-400">No sections found</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Articles</h3>
                      <div className="space-y-2">
                        {note.statutes.articles.length > 0 ? (
                          note.statutes.articles.map((article, index) => (
                            <div key={index} className="p-3 bg-gray-800 rounded-lg">
                              <p className="text-white">{article}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-gray-800/50 rounded-lg text-gray-400">No articles found</div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-4">Precedents</h2>
                  <div className="space-y-3">
                    {note.precedents.map((precedent, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-white">{precedent}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-4">Ratio</h2>
                  <div className="space-y-3">
                    {note.ratio.map((item, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-white">{item}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-4">Rulings</h2>
                  <div className="space-y-3">
                    {note.rulings.map((ruling, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-white">{ruling}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* <section>
                  <h2 className="text-xl font-bold text-white mb-4">Raw Response</h2>
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                      {JSON.stringify(note, null, 2)}
                    </pre>
                  </div>
                </section> */}
              </div>
            </ScrollArea>
          ) : (
            <Tabs defaultValue="citations" className="space-y-6">
            <TabsList className="bg-gray-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="citations" className="data-[state=active]:bg-gray-700">
                <Book className="mr-2 h-4 w-4" />
                Citations
              </TabsTrigger>
              <TabsTrigger value="statutes" className="data-[state=active]:bg-gray-700">
                <Scale className="mr-2 h-4 w-4" />
                Statutes
              </TabsTrigger>
              <TabsTrigger value="precedents" className="data-[state=active]:bg-gray-700">
                <Gavel className="mr-2 h-4 w-4" />
                Precedents
              </TabsTrigger>
              <TabsTrigger value="facts" className="data-[state=active]:bg-gray-700">
                <FileText className="mr-2 h-4 w-4" />
                Facts
              </TabsTrigger>
              <TabsTrigger value="ratio" className="data-[state=active]:bg-gray-700">
                <Scale className="mr-2 h-4 w-4" />
                Ratio
              </TabsTrigger>
              <TabsTrigger value="rulings" className="data-[state=active]:bg-gray-700">
                <Gavel className="mr-2 h-4 w-4" />
                Rulings
              </TabsTrigger>
              <TabsTrigger value="context" className="data-[state=active]:bg-gray-700">
                <FileText className="mr-2 h-4 w-4" />
                Context
              </TabsTrigger>
              <TabsTrigger value="raw" className="data-[state=active]:bg-gray-700">
                <FileText className="mr-2 h-4 w-4" />
                Raw Response
              </TabsTrigger>
            </TabsList>

            <TabsContent value="citations">
              <ScrollArea className="h-[400px] rounded-md border border-gray-800 p-4">
                <div className="space-y-4">
                  {note.citations.map((citation, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-white">{citation}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="statutes">
              <ScrollArea className="h-[400px] rounded-md border border-gray-800 p-4">
                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-3">Acts</h3>
                    <div className="space-y-2">
                      {note.statutes.acts.length > 0 ? (
                        note.statutes.acts.map((act, index) => (
                          <div key={index} className="p-3 bg-gray-800 rounded-lg">
                            <p className="text-white">{act}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-gray-800/50 rounded-lg text-gray-400">No acts found</div>
                      )}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-3">Sections</h3>
                    <div className="space-y-2">
                      {note.statutes.sections.length > 0 ? (
                        note.statutes.sections.map((section, index) => (
                          <div key={index} className="p-3 bg-gray-800 rounded-lg">
                            <p className="text-white">{section}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-gray-800/50 rounded-lg text-gray-400">No sections found</div>
                      )}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-3">Articles</h3>
                    <div className="space-y-2">
                      {note.statutes.articles.length > 0 ? (
                        note.statutes.articles.map((article, index) => (
                          <div key={index} className="p-3 bg-gray-800 rounded-lg">
                            <p className="text-white">{article}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-gray-800/50 rounded-lg text-gray-400">No articles found</div>
                      )}
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="precedents">
              <ScrollArea className="h-[400px] rounded-md border border-gray-800 p-4">
                <div className="space-y-4">
                  {note.precedents.map((precedent, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-white">{precedent}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="facts">
              <ScrollArea className="h-[400px] rounded-md border border-gray-800 p-4">
                <div className="space-y-4">
                  {note.facts.map((fact, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-white">{fact}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ratio">
              <ScrollArea className="h-[400px] rounded-md border border-gray-800 p-4">
                <div className="space-y-4">
                  {note.ratio.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-white">{item}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="rulings">
              <ScrollArea className="h-[400px] rounded-md border border-gray-800 p-4">
                <div className="space-y-4">
                  {note.rulings.map((ruling, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-white">{ruling}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="context">
              <ScrollArea className="h-[400px] rounded-md border border-gray-800 p-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <p className="text-white">{note.context || 'No context available'}</p>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="raw">
              <ScrollArea className="h-[400px] rounded-md border border-gray-800 p-4">
                <pre className="p-4 bg-gray-800 rounded-lg text-white font-mono text-sm whitespace-pre-wrap">
                  {JSON.stringify(note, null, 2)}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          )}

          <div className="mt-6 flex justify-end">
            <div className="text-sm text-gray-400">
              Created by: {typeof note.createdBy === 'string' ? note.createdBy : note.createdBy.name}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}