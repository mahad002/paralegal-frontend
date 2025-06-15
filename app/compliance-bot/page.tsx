'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [jurisdictions, setJurisdictions] = useState('Pakistan');
  const [concerns, setConcerns] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<DueDiligenceRequest | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Use refs to track notification states and prevent duplicate toasts
  const notificationState = useRef({
    hasShownCompletion: false,
    hasShownError: false,
    lastRequestId: '',
    isPolling: false
  });

  // Cleanup function to clear intervals and reset state
  const cleanup = useCallback(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    notificationState.current.isPolling = false;
  }, [pollInterval]);

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const checkRequestStatus = useCallback(async (requestId: string) => {
    // Prevent multiple simultaneous requests
    if (notificationState.current.isPolling) {
      return;
    }

    notificationState.current.isPolling = true;

    try {
      const response = await fetch(`https://paralegal-compliance-bot.onrender.com/due-diligence/${requestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCurrentRequest(data);

      // Check if this is a new request or status change
      const isNewRequest = notificationState.current.lastRequestId !== requestId;
      const hasStatusChanged = data.status !== 'processing';

      if (hasStatusChanged) {
        cleanup(); // Stop polling

        if (data.status === 'completed' && (!notificationState.current.hasShownCompletion || isNewRequest)) {
          notificationState.current.hasShownCompletion = true;
          notificationState.current.lastRequestId = requestId;
          toast({
            title: 'Analysis Complete',
            description: 'Your due diligence report is ready.',
          });
        } else if (data.status === 'error' && (!notificationState.current.hasShownError || isNewRequest)) {
          notificationState.current.hasShownError = true;
          notificationState.current.lastRequestId = requestId;
          toast({
            title: 'Analysis Failed',
            description: data.error || 'An error occurred during analysis.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error checking request status:', error);
      cleanup();
      
      // Only show error toast if we haven't shown one for this request
      if (!notificationState.current.hasShownError) {
        notificationState.current.hasShownError = true;
        toast({
          title: 'Connection Error',
          description: 'Failed to check request status. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      notificationState.current.isPolling = false;
    }
  }, [toast, cleanup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!scope.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide the scope of due diligence.',
        variant: 'destructive',
      });
      return;
    }

    if (!jurisdictions.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please specify the jurisdiction.',
        variant: 'destructive',
      });
      return;
    }

    if (!concerns.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please describe your main areas of concern.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    cleanup(); // Clear any existing polling

    // Reset notification state for new request
    notificationState.current = {
      hasShownCompletion: false,
      hasShownError: false,
      lastRequestId: '',
      isPolling: false
    };

    try {
      const response = await fetch('https://paralegal-compliance-bot.onrender.com/due-diligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scope: scope.trim(),
          jurisdictions: jurisdictions.trim(),
          concerns: concerns.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.guardrail_violated) {
        toast({
          title: 'Guardrail Violation',
          description: data.error || 'Your request violates our content guidelines.',
          variant: 'destructive',
        });
        return;
      }

      if (!data.request_id) {
        throw new Error('No request ID received from server');
      }

      setCurrentRequest(data);
      notificationState.current.lastRequestId = data.request_id;
      
      // Start polling for status updates
      const interval = setInterval(() => {
        checkRequestStatus(data.request_id);
      }, 5000); // Poll every 5 seconds
      
      setPollInterval(interval);

      toast({
        title: 'Request Submitted',
        description: 'Your due diligence request is being processed. This may take a few minutes.',
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Submission Error',
        description: error instanceof Error ? error.message : 'Failed to submit due diligence request.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    cleanup();
    setScope('');
    setJurisdictions('Pakistan');
    setConcerns('');
    setCurrentRequest(null);
    notificationState.current = {
      hasShownCompletion: false,
      hasShownError: false,
      lastRequestId: '',
      isPolling: false
    };
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
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
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
                <label className="text-sm font-medium text-gray-300">
                  Scope of Due Diligence <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="E.g., Assess legal compliance for a business acquisition"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  required
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Jurisdiction <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Pakistan"
                  value={jurisdictions}
                  onChange={(e) => setJurisdictions(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">Note: Only Pakistani jurisdiction is supported</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Main Areas of Concern <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="E.g., Anti-money laundering regulations, corporate governance requirements"
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  required
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || (currentRequest?.status === 'processing')}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                {currentRequest && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    New Request
                  </Button>
                )}
              </div>
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
              {currentRequest.status === 'completed' && currentRequest.result && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg max-h-96 overflow-y-auto">
                    <div className="prose prose-invert max-w-none">
                      <div className="space-y-6">
                        {currentRequest.result.split('\n\n').map((section, index) => {
                          if (!section.trim()) return null;

                          // Handle headers (lines starting with #)
                          if (section.startsWith('#')) {
                            const match = section.match(/^#+/);
                            const level = match ? match[0].length : 0;
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
                                  {items.filter(item => item.trim()).map((item, i) => (
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
                    <p className="text-sm text-gray-500">This may take a few minutes</p>
                  </div>
                </div>
              )}

              {currentRequest.status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-500 font-medium">Analysis Failed</p>
                  </div>
                  <p className="text-red-400">{currentRequest.error || 'An unexpected error occurred during analysis.'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}