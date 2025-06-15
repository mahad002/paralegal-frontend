'use client';

import { useState, useEffect, useCallback } from 'react';
import { Scale, AlertCircle, CheckCircle2, Clock, XCircle, Send, FileText } from 'lucide-react';
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle, ModernCardDescription } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernTextarea } from '@/components/ui/modern-textarea';
import { useNotification } from '@/components/ui/notification-manager';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { addNotification } = useNotification();

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const checkRequestStatus = useCallback(async (requestId: string) => {
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
          addNotification({
            type: 'success',
            title: 'Analysis Complete',
            message: 'Your due diligence report is ready.',
            duration: 5000
          });
        } else if (data.status === 'error') {
          addNotification({
            type: 'error',
            title: 'Analysis Failed',
            message: data.error || 'An error occurred during analysis.',
            duration: 8000
          });
        }
      }
    } catch (error) {
      console.error('Error checking request status:', error);
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to check request status.',
        duration: 5000
      });
    }
  }, [pollInterval, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scope.trim() || !concerns.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in all required fields.',
        duration: 5000
      });
      return;
    }

    setIsSubmitting(true);

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

      const data = await response.json();

      if (data.guardrail_violated) {
        addNotification({
          type: 'error',
          title: 'Guardrail Violation',
          message: data.error,
          duration: 8000
        });
        return;
      }

      setCurrentRequest(data);
      
      // Start polling for status with a unique interval
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      
      const interval = setInterval(() => checkRequestStatus(data.request_id), 5000);
      setPollInterval(interval);

      addNotification({
        type: 'info',
        title: 'Request Submitted',
        message: 'Your due diligence request is being processed.',
        duration: 5000
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit due diligence request. Please try again.',
        duration: 8000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatResult = (result: string) => {
    return result.split('\n\n').map((section, index) => {
      // Handle headers (lines starting with #)
      if (section.startsWith('#')) {
        const match = section.match(/^#+/);
        const level = match ? match[0].length : 0;
        const text = section.replace(/^#+\s*/, '');
        return (
          <h3 key={index} className={`${level === 1 ? 'text-xl' : 'text-lg'} font-bold text-white mb-3`}>
            {text}
          </h3>
        );
      }
      
      // Handle lists (lines starting with -)
      if (section.includes('\n-')) {
        const [title, ...items] = section.split('\n');
        return (
          <div key={index} className="mb-4">
            {title && <p className="text-white font-medium mb-2">{title}</p>}
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <span className="text-blue-400 mt-1.5 text-xs">●</span>
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
          className="text-gray-300 mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Due Diligence Assistant</h1>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          AI-powered legal compliance analysis for Pakistani jurisdiction. Get comprehensive due diligence reports for your business needs.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Submit Due Diligence Request
              </ModernCardTitle>
              <ModernCardDescription>
                Provide details about your compliance requirements and get AI-powered analysis.
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <ModernTextarea
                  label="Scope of Due Diligence *"
                  placeholder="e.g., Assess legal compliance for a business acquisition, merger, or investment"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  required
                  rows={3}
                />

                <ModernInput
                  label="Jurisdiction"
                  placeholder="Pakistan"
                  value={jurisdictions}
                  onChange={(e) => setJurisdictions(e.target.value)}
                  required
                  helperText="Currently only Pakistani jurisdiction is supported"
                />

                <ModernTextarea
                  label="Main Areas of Concern *"
                  placeholder="e.g., Anti-money laundering regulations, corporate governance, tax compliance"
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  required
                  rows={3}
                />

                <ModernButton
                  type="submit"
                  loading={isSubmitting}
                  fullWidth
                  icon={!isSubmitting ? <Send className="h-4 w-4" /> : undefined}
                >
                  {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
                </ModernButton>
              </form>
            </ModernCardContent>
          </ModernCard>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {currentRequest ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <ModernCard>
                  <ModernCardHeader>
                    <div className="flex items-center justify-between">
                      <ModernCardTitle>Analysis Results</ModernCardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(currentRequest.status)}
                        <span className={`text-sm font-medium capitalize ${getStatusColor(currentRequest.status)}`}>
                          {currentRequest.status}
                        </span>
                      </div>
                    </div>
                    <ModernCardDescription>
                      Request ID: {currentRequest.request_id}
                    </ModernCardDescription>
                  </ModernCardHeader>
                  <ModernCardContent>
                    {currentRequest.status === 'completed' && currentRequest.result && (
                      <div className="bg-gray-800/50 rounded-lg p-6 max-h-96 overflow-y-auto">
                        <div className="prose prose-invert max-w-none">
                          {formatResult(currentRequest.result)}
                        </div>
                      </div>
                    )}

                    {currentRequest.status === 'processing' && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mb-4"
                        />
                        <p className="text-gray-400 mb-2">Analyzing your request...</p>
                        <p className="text-sm text-gray-500">This may take a few minutes</p>
                      </div>
                    )}

                    {currentRequest.status === 'error' && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
                        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 font-medium mb-2">Analysis Failed</p>
                        <p className="text-red-300 text-sm">{currentRequest.error}</p>
                      </div>
                    )}
                  </ModernCardContent>
                </ModernCard>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ModernCard className="border-dashed border-gray-700">
                  <ModernCardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Scale className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">
                      No Analysis Yet
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Submit a due diligence request to see results here
                    </p>
                  </ModernCardContent>
                </ModernCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}