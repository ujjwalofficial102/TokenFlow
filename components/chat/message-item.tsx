'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/types';
import { OptimizationBadge } from './optimization-badge';
import { OptimizationDetails } from './optimization-details';
import { Copy, Check, Bot, User, Sparkles } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/10 border border-emerald-500/20 text-sm leading-relaxed">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-8">
      <div className="flex items-start gap-3 w-full max-w-[95%] sm:max-w-[90%]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/10 shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
          {/* Top Optimization Origin Badge */}
          {message.metrics && (
            <div className="mb-4 pb-3 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
              <OptimizationBadge
                source={message.metrics.source}
                responseTimeMs={message.metrics.responseTimeMs}
                tokensSaved={message.metrics.tokensSaved}
                similarityScore={message.metrics.similarityScore}
              />
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-xs flex items-center gap-1 font-medium"
                title="Copy response to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}

          {/* Assistant Response Markdown Content */}
          <div className="prose prose-invert prose-slate max-w-none text-sm leading-relaxed text-slate-200">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* Expandable Optimization Details Panel */}
          {message.metrics && <OptimizationDetails metrics={message.metrics} />}
        </div>
      </div>
    </div>
  );
}
