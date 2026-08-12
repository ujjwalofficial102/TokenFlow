'use client';

import React, { useState, useEffect } from 'react';
import { countTokens } from '@/lib/tokenizer/counter';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface PromptInputProps {
  onSend: (prompt: string) => void;
  loading: boolean;
}

export function PromptInput({ onSend, loading }: PromptInputProps) {
  const [input, setInput] = useState('');
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    setTokenCount(countTokens(input));
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask TokenFlow AI…"
          rows={3}
          disabled={loading}
          className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
        />

        <div className="flex items-center justify-between pt-2 px-3 border-t border-slate-800/60">
          {/* Live Input Token Counter badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px]">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Input Tokens: <strong className="text-emerald-400 font-bold">{tokenCount}</strong></span>
            </span>
            <span className="hidden sm:inline text-slate-500 text-[11px]">Press Enter to send</span>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing & Processing...</span>
              </>
            ) : (
              <>
                <span>Send Query</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
