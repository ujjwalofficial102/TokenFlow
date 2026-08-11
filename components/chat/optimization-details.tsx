'use client';

import React, { useState } from 'react';
import { MessageMetrics } from '@/types';
import { ChevronDown, ChevronUp, Layers, CheckCircle, XCircle } from 'lucide-react';

interface OptimizationDetailsProps {
  metrics: MessageMetrics;
}

export function OptimizationDetails({ metrics }: OptimizationDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-3 rounded-xl bg-slate-950/70 border border-slate-800/80 overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-900/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Optimization Details & Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono">
            {metrics.source} • {metrics.responseTimeMs}ms
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-800/80 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400 font-medium">Source</span>
              <span className="font-semibold text-emerald-400">{metrics.source}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400 font-medium">Original Prompt Tokens</span>
              <span className="font-mono font-medium text-slate-200">{metrics.originalPromptTokens}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400 font-medium">Optimized Prompt Tokens</span>
              <span className="font-mono font-medium text-teal-400">{metrics.optimizedPromptTokens}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400 font-medium">Tokens Saved</span>
              <span className="font-mono font-semibold text-emerald-400">+{metrics.tokensSaved}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400 font-medium">Similarity Score</span>
              <span className="font-mono font-medium text-purple-400">
                {metrics.similarityScore !== undefined ? `${metrics.similarityScore}%` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400 font-medium">LLM Called</span>
              <span className="font-semibold inline-flex items-center gap-1">
                {metrics.llmCalled ? (
                  <span className="text-amber-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Yes (Gemini API)</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> No (Bypassed API)</span>
                )}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40 sm:col-span-2">
              <span className="text-slate-400 font-medium">Response Time</span>
              <span className="font-mono font-medium text-cyan-400">{metrics.responseTimeMs} ms</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
