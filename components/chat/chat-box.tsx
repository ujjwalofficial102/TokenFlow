'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, SystemMetrics, ChatApiResponse } from '@/types';
import { MessageItem } from './message-item';
import { PromptInput } from './prompt-input';
import { StatsBar } from '../analytics/stats-bar';
import { Sparkles, Zap, Database, ArrowRight, ShieldCheck } from 'lucide-react';

interface ChatBoxProps {
  systemMetrics: SystemMetrics;
  onUpdateMetrics: (metrics: SystemMetrics) => void;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
}

const SAMPLE_PROMPTS = [
  {
    title: '1. Test Gemini Generation',
    prompt: 'What is MERN Stack?',
    desc: 'Triggers fresh Gemini LLM response (Cache Miss)',
    icon: Sparkles,
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
  },
  {
    title: '2. Test Redis Exact Match',
    prompt: 'What is MERN Stack?',
    desc: 'Triggers instant Redis Exact Cache Hit (< 20ms)',
    icon: Zap,
    color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
  },
  {
    title: '3. Test Vector Semantic Match',
    prompt: 'Explain MERN Stack for a beginner.',
    desc: 'Triggers Pinecone Semantic Retrieval (Similarity Match > 85%)',
    icon: Database,
    color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
  },
];

export function ChatBox({
  systemMetrics,
  onUpdateMetrics,
  messages,
  onMessagesChange,
}: ChatBoxProps) {
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ prompt: promptText }),
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-4 h-4" /> Multi-Layer AI Token Optimization Middleware
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Optimize LLM Costs & Latency in Real-Time
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mb-10 leading-relaxed">
              TokenFlow uses <strong className="text-teal-400">Prompt Compression</strong>, <strong className="text-cyan-400">Upstash Redis Exact Caching</strong>, and <strong className="text-purple-400">Pinecone Semantic Retrieval</strong> to bypass redundant LLM API calls.
            </p>

            {/* Quick Demo Cards */}
            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {SAMPLE_PROMPTS.map((card, i) => {
                const Icon = card.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSendPrompt(card.prompt)}
                    className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col justify-between group ${card.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">{card.title}</span>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-semibold text-white mb-2">"{card.prompt}"</p>
                      <p className="text-xs text-slate-400 leading-snug">{card.desc}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                      <span>Test Prompt</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
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
