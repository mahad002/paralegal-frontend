'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { History, User, Calendar, Search, Filter, MessageSquare, Bot, Clock } from 'lucide-react';
import * as ChatHistoryAPI from '@/lib/api/ChatHistory';
import type { ChatHistory } from '@/types';

export default function HistoryLogsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [botFilter, setBotFilter] = useState<'all' | 'Assistance' | 'Compliance'>('all');

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const [assistanceHistory, complianceHistory] = await Promise.all([
          ChatHistoryAPI.getAssistanceChatHistory(user?._id || ''),
          ChatHistoryAPI.getComplianceChatHistory()
        ]);

        const combinedHistory = [
          ...(!('error' in assistanceHistory) ? assistanceHistory : []),
          ...(!('error' in complianceHistory) ? complianceHistory : [])
        ];

        setChatHistory(combinedHistory);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  const filteredHistory = chatHistory
    .filter(chat => 
      botFilter === 'all' || chat.botType === botFilter
    )
    .filter(chat =>
      chat.messages.some(msg => 
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const getBotIcon = (type: 'Assistance' | 'Compliance') => {
    switch (type) {
      case 'Assistance':
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'Compliance':
        return <Bot className="h-4 w-4 text-green-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <History className="h-8 w-8 text-cyan-400" />
        <h1 className="text-3xl font-bold text-white">Chat History</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <Card className="flex-1 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Total Conversations</CardTitle>
            <CardDescription className="text-gray-400">
              All chat interactions with our AI assistants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <MessageSquare className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Assistance Bot</p>
                  <p className="text-2xl font-bold text-white">
                    {chatHistory.filter(c => c.botType === 'Assistance').length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Bot className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Compliance Bot</p>
                  <p className="text-2xl font-bold text-white">
                    {chatHistory.filter(c => c.botType === 'Compliance').length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:w-96 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Filter Chats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={botFilter} onValueChange={(value: any) => setBotFilter(value)}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by bot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bots</SelectItem>
                <SelectItem value="Assistance">Assistance Bot</SelectItem>
                <SelectItem value="Compliance">Compliance Bot</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5" />
            Chat Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-300">Bot Type</TableHead>
                  <TableHead className="text-gray-300">Last Message</TableHead>
                  <TableHead className="text-gray-300">Messages</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((chat) => (
                    <TableRow key={chat._id} className="border-gray-800">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getBotIcon(chat.botType)}
                          <span className="text-white">{chat.botType} Bot</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-gray-300 truncate">
                          {chat.messages[chat.messages.length - 1]?.message}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                          {chat.messages.length} messages
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-gray-300">
                          <Clock className="mr-2 h-4 w-4 text-gray-400" />
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                      No chat history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}