'use client';

import React from 'react';
import { SystemMetrics } from '@/types';
import { Zap, Database, Cpu, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface StatsBarProps {
  metrics: SystemMetrics;
}

export function StatsBar({ metrics }: StatsBarProps) {
  const hitRate = metrics.totalRequestsProcessed > 0
    ? Math.round((metrics.cacheHits / metrics.totalRequestsProcessed) * 100)
    : 0;

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      
      {/* 1. Cache Hits */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Cache Hits</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-white">{metrics.cacheHits}</span>
          <span className="text-[11px] font-semibold text-emerald-400">{hitRate}% rate</span>
        </div>
      </div>

      {/* 2. Cache Misses */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Cache Misses</span>
          <XCircle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-white">{metrics.cacheMisses}</span>
          <span className="text-[11px] text-slate-500 font-medium">LLM executed</span>
        </div>
      </div>

      {/* 3. LLM Calls Saved */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>LLM Saved</span>
          <Zap className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-cyan-400">{metrics.totalLLMCallsSaved}</span>
          <span className="text-[11px] text-cyan-400/80 font-medium">Calls bypassed</span>
        </div>
      </div>

      {/* 4. Total Requests */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Total Queries</span>
          <Cpu className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-white">{metrics.totalRequestsProcessed}</span>
          <span className="text-[11px] text-slate-500 font-medium">Processed</span>
        </div>
      </div>

      {/* 5. Tokens Saved */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Tokens Saved</span>
          <Sparkles className="w-4 h-4 text-teal-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-teal-400">{metrics.totalTokensSaved.toLocaleString()}</span>
          <span className="text-[11px] text-teal-400/80 font-medium">Saved</span>
        </div>
      </div>

      {/* 6. Knowledge Base Size */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Vector KB Size</span>
          <Database className="w-4 h-4 text-purple-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold text-purple-400">{metrics.totalKnowledgeBaseItems}</span>
          <span className="text-[11px] text-purple-400/80 font-medium">Vectors</span>
        </div>
      </div>

    </div>
  );
}
