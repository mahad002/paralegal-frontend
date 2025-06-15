'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scale, Send, Bot, User, CheckCircle2, Clock, XCircle, RefreshCw, MessageSquare } from 'lucide-react';
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
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  status?: 'processing' | 'completed' | 'error';
  requestId?: string;
}

export default function ComplianceBotPage() {
  const [scope, setScope] = useState('');
  const [jurisdictions, setJurisdictions] = useState('Pakistan');
  const [concerns, setConcerns] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: 'Hello! I\'m your Due Diligence Assistant. I can help you analyze legal compliance for your business needs in Pakistan. Please fill out the form and click "Send Request" to get started.',
      timestamp: new Date(),
      status: 'completed'
    }
  ]);
  const [activeRequests, setActiveRequests] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    if (!activeRequests.has(requestId)) return;

    try {
      const response = await fetch(`https://paralegal-compliance-bot.onrender.com/due-diligence/${requestId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DueDiligenceRequest = await response.json();

      if (data.status === 'completed' && data.result) {
        updateMessage(messageId, {
          content: data.result,
          status: 'completed'
        });
        setActiveRequests(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
        
        toast({
          title: 'Analysis Complete',
          description: 'Your due diligence report is ready.',
        });
      } else if (data.status === 'error') {
        updateMessage(messageId, {
          content: `Analysis failed: ${data.error || 'An unexpected error occurred.'}`,
          status: 'error'
        });
        setActiveRequests(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
        
        toast({
          title: 'Analysis Failed',
          description: data.error || 'An error occurred during analysis.',
          variant: 'destructive',
        });
      }
      // If still processing, the polling will continue
    } catch (error) {
      console.error('Error checking request status:', error);
      updateMessage(messageId, {
        content: 'Failed to check request status. Please try again.',
        status: 'error'
      });
      setActiveRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  }, [activeRequests, updateMessage, toast]);

  // Polling effect for active requests
  useEffect(() => {
    if (activeRequests.size === 0) return;

    const interval = setInterval(() => {
      messages.forEach(msg => {
        if (msg.requestId && msg.status === 'processing' && activeRequests.has(msg.requestId)) {
          checkRequestStatus(msg.requestId, msg.id);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeRequests, messages, checkRequestStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!scope.trim() || !jurisdictions.trim() || !concerns.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Add user message
    const userMessage = `**Due Diligence Request**

**Scope:** ${scope.trim()}
**Jurisdiction:** ${jurisdictions.trim()}
**Areas of Concern:** ${concerns.trim()}`;

    addMessage({
      type: 'user',
      content: userMessage,
      status: 'completed'
    });

    // Add bot processing message
    const botMessageId = addMessage({
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

      const data: DueDiligenceRequest = await response.json();

      if (data.guardrail_violated) {
        updateMessage(botMessageId, {
          content: `Request rejected: ${data.error || 'Your request violates our content guidelines.'}`,
          status: 'error'
        });
        
        toast({
          title: 'Request Rejected',
          description: data.error || 'Your request violates our content guidelines.',
          variant: 'destructive',
        });
        return;
      }

      if (!data.request_id) {
        throw new Error('No request ID received');
      }

      // Update message with request ID and start tracking
      updateMessage(botMessageId, {
        requestId: data.request_id
      });

      setActiveRequests(prev => new Set([...prev, data.request_id]));

      // Clear form
      setScope('');
      setConcerns('');

      toast({
        title: 'Request Submitted',
        description: 'Your analysis request is being processed.',
      });

    } catch (error) {
      console.error('Error submitting request:', error);
      updateMessage(botMessageId, {
        content: `Failed to submit request: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        status: 'error'
      });
      
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit request.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetChat = () => {
    setActiveRequests(new Set());
    setScope('');
    setJurisdictions('Pakistan');
    setConcerns('');
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        content: 'Hello! I\'m your Due Diligence Assistant. I can help you analyze legal compliance for your business needs in Pakistan. Please fill out the form and click "Send Request" to get started.',
        timestamp: new Date(),
        status: 'completed'
      }
    ]);
  };

  const formatBotMessage = (content: string) => {
    // Handle different content types
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('#')) {
        const level = (line.match(/^#+/) || [''])[0].length;
        const text = line.replace(/^#+\s*/, '');
        return (
          <h3 key={index} className={`font-bold text-white mb-2 ${level === 1 ? 'text-lg' : 'text-base'}`}>
            {text}
          </h3>
        );
      }
      
      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/);
        return (
          <p key={index} className="text-gray-300 mb-2">
            {parts.map((part, i) => 
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={i} className="text-white">{part.slice(2, -2)}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
      
      // List items
      if (line.startsWith('-') || line.startsWith('•')) {
        return (
          <div key={index} className="flex items-start gap-2 mb-1">
            <span className="text-cyan-400 mt-1">•</span>
            <span className="text-gray-300 text-sm">{line.replace(/^[-•]\s*/, '')}</span>
          </div>
        );
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="text-gray-300 mb-2 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full">
          <Scale className="h-8 w-8 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Due Diligence Assistant</h1>
          <p className="text-gray-400">AI-powered legal compliance analysis for Pakistan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface - Takes up 3/4 of the space */}
        <div className="lg:col-span-3">
          <Card className="bg-gray-900 border-gray-800 h-[700px] flex flex-col">
            <CardHeader className="border-b border-gray-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-full">
                    <MessageSquare className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Legal Compliance Chat</CardTitle>
                    <CardDescription className="text-gray-400">
                      Real-time due diligence analysis
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
            
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'bot' && (
                        <div className="flex-shrink-0 p-2 rounded-full bg-gray-800">
                          {message.status === 'processing' ? (
                            <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />
                          ) : message.status === 'error' ? (
                            <XCircle className="h-4 w-4 text-red-400" />
                          ) : (
                            <Bot className="h-4 w-4 text-cyan-400" />
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] ${message.type === 'user' ? 'order-first' : ''}`}>
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
                            <div className="whitespace-pre-line text-sm">
                              {message.content.split('\n').map((line, i) => (
                                <div key={i} className={line.startsWith('**') ? 'font-semibold mb-1' : 'mb-1'}>
                                  {line.replace(/\*\*/g, '')}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm">
                              {message.status === 'processing' ? (
                                <div className="flex items-center gap-2 text-gray-300">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
                                  <span>{message.content}</span>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {formatBotMessage(message.content)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 px-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      
                      {message.type === 'user' && (
                        <div className="flex-shrink-0 p-2 rounded-full bg-blue-500/10">
                          <User className="h-4 w-4 text-blue-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Input Form - Takes up 1/4 of the space */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-gray-800 sticky top-6">
            <CardHeader>
              <CardTitle className="text-white">New Request</CardTitle>
              <CardDescription className="text-gray-400">
                Fill out the form to submit a new analysis request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Scope of Due Diligence *
                  </label>
                  <Textarea
                    placeholder="E.g., Business acquisition compliance review"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm resize-none"
                    required
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Jurisdiction *
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
                    Areas of Concern *
                  </label>
                  <Textarea
                    placeholder="E.g., Anti-money laundering, corporate governance"
                    value={concerns}
                    onChange={(e) => setConcerns(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm resize-none"
                    required
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || activeRequests.size > 0}
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
                      Send Request
                    </>
                  )}
                </Button>

                {activeRequests.size > 0 && (
                  <div className="text-xs text-yellow-400 text-center">
                    {activeRequests.size} request(s) processing...
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}