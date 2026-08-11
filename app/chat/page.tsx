'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/common/navbar';
import { ChatBox } from '@/components/chat/chat-box';
import { SystemMetrics, ChatMessage } from '@/types';
import { useAuth } from '@/components/auth/auth-provider';

const initialMetrics: SystemMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  totalLLMCallsSaved: 0,
  totalRequestsProcessed: 0,
  totalTokensSaved: 0,
  totalKnowledgeBaseItems: 0,
};

export default function ChatPage() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>(initialMetrics);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSystemMetrics(data);
        }
      })
      .catch((err) => console.warn('Failed to load metrics:', err));
  }, []);

  const handleClearChat = () => {
    setMessages([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Loading TokenFlow Middleware...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar systemMetrics={systemMetrics} onClearChat={messages.length > 0 ? handleClearChat : undefined} />
      <main className="flex-1 flex flex-col">
        <ChatBox
          systemMetrics={systemMetrics}
          onUpdateMetrics={setSystemMetrics}
          messages={messages}
          onMessagesChange={setMessages}
        />
      </main>
    </div>
  );
}
