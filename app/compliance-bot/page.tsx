'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scale, Send, Bot, User, CheckCircle2, Clock, XCircle, RefreshCw, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DueDiligenceRequest {
  request_id: string;
  status: 'processing' | 'completed' | 'error';
  result?: string;
  guardrail_violated?: boolean;
  error?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  status?: 'processing' | 'completed' | 'error';
  requestData?: {
    scope: string;
    jurisdictions: string;
    concerns: string;
  };
}

export default function ComplianceBotPage() {
  const [scope, setScope] = useState('');
  const [jurisdictions, setJurisdictions] = useState('Pakistan');
  const [concerns, setConcerns] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<DueDiligenceRequest | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your Due Diligence Assistant. I can help you analyze legal compliance for your business needs in Pakistan. Please provide the details of your request below.',
      timestamp: new Date(),
    }
  ]);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Use refs to track notification states and prevent duplicate toasts
  const notificationState = useRef({
    hasShownCompletion: false,
    hasShownError: false,
    lastRequestId: '',
    isPolling: false
  });

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

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

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  const checkRequestStatus = useCallback(async (requestId: string, messageId: string) => {
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

        if (data.status === 'completed' && data.result) {
          updateMessage(messageId, {
            content: data.result,
            status: 'completed'
          });
          
          if (!notificationState.current.hasShownCompletion || isNewRequest) {
            notificationState.current.hasShownCompletion = true;
            notificationState.current.lastRequestId = requestId;
            toast({
              title: 'Analysis Complete',
              description: 'Your due diligence report is ready.',
            });
          }
        } else if (data.status === 'error') {
          updateMessage(messageId, {
            content: `Analysis failed: ${data.error || 'An unexpected error occurred during analysis.'}`,
            status: 'error'
          });
          
          if (!notificationState.current.hasShownError || isNewRequest) {
            notificationState.current.hasShownError = true;
            notificationState.current.lastRequestId = requestId;
            toast({
              title: 'Analysis Failed',
              description: data.error || 'An error occurred during analysis.',
              variant: 'destructive',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking request status:', error);
      cleanup();
      
      updateMessage(messageId, {
        content: 'Failed to check request status. Please try again.',
        status: 'error'
      });
      
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
  }, [toast, cleanup, updateMessage]);

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

    // Add user message
    const userMessageContent = `**Due Diligence Request**

**Scope:** ${scope.trim()}
**Jurisdiction:** ${jurisdictions.trim()}
**Areas of Concern:** ${concerns.trim()}`;

    addMessage({
      type: 'user',
      content: userMessageContent,
      requestData: {
        scope: scope.trim(),
        jurisdictions: jurisdictions.trim(),
        concerns: concerns.trim(),
      }
    });

    // Add processing message
    const processingMessageId = addMessage({
      type: 'bot',
      content: 'Analyzing your request... This may take a few minutes.',
      status: 'processing'
    });

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
        updateMessage(processingMessageId, {
          content: `Request rejected: ${data.error || 'Your request violates our content guidelines.'}`,
          status: 'error'
        });
        
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
        checkRequestStatus(data.request_id, processingMessageId);
      }, 5000); // Poll every 5 seconds
      
      setPollInterval(interval);

      // Clear form
      setScope('');
      setConcerns('');

    } catch (error) {
      console.error('Error submitting request:', error);
      updateMessage(processingMessageId, {
        content: `Submission failed: ${error instanceof Error ? error.message : 'Failed to submit due diligence request.'}`,
        status: 'error'
      });
      
      toast({
        title: 'Submission Error',
        description: error instanceof Error ? error.message : 'Failed to submit due diligence request.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetChat = () => {
    cleanup();
    setScope('');
    setJurisdictions('Pakistan');
    setConcerns('');
    setCurrentRequest(null);
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: 'Hello! I\'m your Due Diligence Assistant. I can help you analyze legal compliance for your business needs in Pakistan. Please provide the details of your request below.',
        timestamp: new Date(),
      }
    ]);
    notificationState.current = {
      hasShownCompletion: false,
      hasShownError: false,
      lastRequestId: '',
      isPolling: false
    };
  };

  const formatMessageContent = (content: string) => {
    // Split content into sections
    const sections = content.split('\n\n').filter(section => section.trim());
    
    return sections.map((section, index) => {
      if (!section.trim()) return null;

      // Handle headers (lines starting with #)
      if (section.startsWith('#')) {
        const match = section.match(/^#+/);
        const level = match ? match[0].length : 0;
        const text = section.replace(/^#+\s*/, '');
        return (
          <div key={index} className={`${level === 1 ? 'text-lg' : 'text-base'} font-bold text-white mb-2`}>
            {text}
          </div>
        );
      }
      
      // Handle lists (lines starting with -)
      if (section.includes('\n-')) {
        const [title, ...items] = section.split('\n');
        return (
          <div key={index} className="mb-4">
            {title && <p className="text-white font-medium mb-2">{title}</p>}
            <ul className="list-none space-y-1">
              {items.filter(item => item.trim()).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-cyan-400 mt-1">•</span>
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
          className="text-gray-300 text-sm mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  const getMessageIcon = (message: ChatMessage) => {
    if (message.type === 'user') {
      return <User className="h-4 w-4" />;
    }
    
    if (message.status === 'processing') {
      return <Clock className="h-4 w-4 animate-pulse" />;
    }
    
    if (message.status === 'error') {
      return <XCircle className="h-4 w-4" />;
    }
    
    if (message.status === 'completed') {
      return <CheckCircle2 className="h-4 w-4" />;
    }
    
    return <Bot className="h-4 w-4" />;
  };

  const getMessageIconColor = (message: ChatMessage) => {
    if (message.type === 'user') {
      return 'text-blue-400';
    }
    
    if (message.status === 'processing') {
      return 'text-yellow-400';
    }
    
    if (message.status === 'error') {
      return 'text-red-400';
    }
    
    if (message.status === 'completed') {
      return 'text-green-400';
    }
    
    return 'text-cyan-400';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full">
          <Scale className="h-8 w-8 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Due Diligence Assistant</h1>
          <p className="text-gray-400">AI-powered legal compliance analysis for Pakistan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800 h-[600px] flex flex-col">
            <CardHeader className="border-b border-gray-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-full">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">Legal Compliance Chat</CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      Real-time analysis and guidance
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetChat}
                  className="text-gray-400 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0 flex flex-col">
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type !== 'user' && (
                        <div className={`p-2 rounded-full bg-gray-800 ${getMessageIconColor(message)}`}>
                          {getMessageIcon(message)}
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                        <div
                          className={`p-4 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                              : message.status === 'error'
                              ? 'bg-red-500/10 border border-red-500/20'
                              : 'bg-gray-800'
                          }`}
                        >
                          {message.type === 'user' ? (
                            <div className="text-sm">
                              {message.content.split('\n').map((line, i) => (
                                <div key={i} className={line.startsWith('**') ? 'font-semibold' : ''}>
                                  {line.replace(/\*\*/g, '')}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm">
                              {message.status === 'processing' ? (
                                <div className="flex items-center gap-2 text-gray-300">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
                                  {message.content}
                                </div>
                              ) : (
                                formatMessageContent(message.content)
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 px-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      
                      {message.type === 'user' && (
                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-gray-800 sticky top-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">New Analysis Request</CardTitle>
              <CardDescription className="text-gray-400">
                Provide details for legal compliance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Scope of Due Diligence
                  </label>
                  <Textarea
                    placeholder="E.g., Business acquisition compliance review"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm"
                    required
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Jurisdiction
                  </label>
                  <Input
                    value={jurisdictions}
                    onChange={(e) => setJurisdictions(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500">Currently supports Pakistan only</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Areas of Concern
                  </label>
                  <Textarea
                    placeholder="E.g., Anti-money laundering, corporate governance"
                    value={concerns}
                    onChange={(e) => setConcerns(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm"
                    required
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || (currentRequest?.status === 'processing')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Analyze Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}