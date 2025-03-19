'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Scale, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DueDiligenceRequest {
  request_id: string;
  status: 'processing' | 'completed' | 'error';
  result?: string;
  guardrail_violated?: boolean;
  error?: string;
}

export default function ComplianceBotPage() {
  const [scope, setScope] = useState('');
  const [jurisdictions, setJurisdictions] = useState('');
  const [concerns, setConcerns] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<DueDiligenceRequest | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const checkRequestStatus = async (requestId: string) => {
    try {
      const response = await fetch(`https://paralegal-compliance-bot.onrender.com/due-diligence/${requestId}`);
      const data = await response.json();
      setCurrentRequest(data);

      if (data.status !== 'processing') {
        if (pollInterval) {
          clearInterval(pollInterval);
          setPollInterval(null);
        }

        if (data.status === 'completed') {
          toast({
            title: 'Analysis Complete',
            description: 'Your due diligence report is ready.',
          });
        } else if (data.status === 'error') {
          toast({
            title: 'Analysis Failed',
            description: data.error || 'An error occurred during analysis.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error checking request status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://paralegal-compliance-bot.onrender.com/due-diligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scope,
          jurisdictions,
          concerns,
        }),
      });

      const data = await response.json();

      if (data.guardrail_violated) {
        toast({
          title: 'Guardrail Violation',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setCurrentRequest(data);
      
      // Start polling for status
      const interval = setInterval(() => checkRequestStatus(data.request_id), 5000);
      setPollInterval(interval);

      toast({
        title: 'Request Submitted',
        description: 'Your due diligence request is being processed.',
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit due diligence request.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'processing':
        return 'text-blue-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Scale className="h-8 w-8 text-cyan-400" />
        <h1 className="text-3xl font-bold text-white">Due Diligence Assistant</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Submit Due Diligence Request</CardTitle>
            <CardDescription className="text-gray-400">
              Our AI-powered bot will analyze legal compliance for your business needs in Pakistan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Scope of Due Diligence</label>
                <Textarea
                  placeholder="E.g., Assess legal compliance for a business acquisition"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Jurisdiction</label>
                <Input
                  placeholder="Pakistan"
                  value={jurisdictions}
                  onChange={(e) => setJurisdictions(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
                <p className="text-xs text-gray-500">Note: Only Pakistani jurisdiction is supported</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Main Areas of Concern</label>
                <Textarea
                  placeholder="E.g., Anti-money laundering regulations"
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {currentRequest && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Analysis Results</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentRequest.status)}
                  <span className={`text-sm font-medium capitalize ${getStatusColor(currentRequest.status)}`}>
                    {currentRequest.status}
                  </span>
                </div>
              </div>
              <CardDescription className="text-gray-400">
                Request ID: {currentRequest.request_id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentRequest.status === 'completed' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="prose prose-invert max-w-none">
                      <div className="space-y-6">
                        {currentRequest.result?.split('\n\n').map((section, index) => {
                          // Handle headers (lines starting with #)
                          if (section.startsWith('#')) {
                            const level = section.match(/^#+/)[0].length;
                            const text = section.replace(/^#+\s*/, '');
                            return (
                              <div key={index} className={`${level === 1 ? 'text-2xl' : 'text-xl'} font-bold text-white`}>
                                {text}
                              </div>
                            );
                          }
                          
                          // Handle lists (lines starting with -)
                          if (section.includes('\n-')) {
                            const [title, ...items] = section.split('\n');
                            return (
                              <div key={index} className="space-y-2">
                                {title && <p className="text-white font-medium">{title}</p>}
                                <ul className="list-none space-y-2">
                                  {items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-300">
                                      <span className="text-cyan-400 mt-1.5">•</span>
                                      <span>{item.replace(/^-\s*/, '')}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }

                          // Handle bold text (wrapped in **)
                          const formattedText = section.replace(
                            /\*\*(.*?)\*\*/g,
                            '<span class="font-semibold text-white">$1</span>'
                          );

                          return (
                            <div
                              key={index}
                              className="text-gray-300"
                              dangerouslySetInnerHTML={{ __html: formattedText }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentRequest.status === 'processing' && (
                <div className="flex items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                    <p className="text-gray-400">Analyzing your request...</p>
                  </div>
                </div>
              )}

              {currentRequest.status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-500">{currentRequest.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

