'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, SystemMetrics, ChatApiResponse } from '@/types';
import { MessageItem } from './message-item';
import { PromptInput } from './prompt-input';
import { StatsBar } from '../analytics/stats-bar';
import { useAuth } from '../auth/auth-provider';

interface ChatBoxProps {
  systemMetrics: SystemMetrics;
  onUpdateMetrics: (metrics: SystemMetrics) => void;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
}

export function ChatBox({
  systemMetrics,
  onUpdateMetrics,
  messages,
  onMessagesChange,
}: ChatBoxProps) {
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(() => 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendPrompt = async (promptText: string) => {
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: promptText,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    onMessagesChange(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          userId: user?.uid,
          conversationId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: ChatApiResponse = await res.json();

      const assistantMsg: ChatMessage = {
        id: data.id,
        role: 'assistant',
        content: data.response,
        metrics: data.metrics,
        createdAt: new Date().toISOString(),
      };

      onMessagesChange([...newMessages, assistantMsg]);
      onUpdateMetrics(data.systemMetrics);
    } catch (err: any) {
      console.error('Send Error:', err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Middleware Error**: ${err?.message || 'Failed to process prompt. Please try again.'}`,
        createdAt: new Date().toISOString(),
      };
      onMessagesChange([...newMessages, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Top Runtime Stats Bar */}
      <StatsBar metrics={systemMetrics} />

      {/* Main Messages Container */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
            <p className="text-slate-500 text-sm font-medium tracking-wide">
              Ask your question to TokenFlow AI
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Bar */}
      <div className="pt-4 mt-auto">
        <PromptInput onSend={handleSendPrompt} loading={loading} />
      </div>
    </div>
  );
}
