'use client';

import React from 'react';
import { MessageSource } from '@/types';
import { Zap, Database, Cpu, Clock, Sparkles } from 'lucide-react';

interface OptimizationBadgeProps {
  source: MessageSource;
  responseTimeMs: number;
  tokensSaved: number;
  similarityScore?: number;
}

export function OptimizationBadge({
  source,
  responseTimeMs,
  tokensSaved,
  similarityScore,
}: OptimizationBadgeProps) {
  let badgeStyle = '';
  let Icon = Cpu;
  let label: string = source;

  switch (source) {
    case 'Redis Cache':
      badgeStyle = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
      Icon = Zap;
      label = 'Redis Exact Cache';
      break;
    case 'Vector Database':
      badgeStyle = 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      Icon = Database;
      label = 'Vector Semantic DB';
      break;
    case 'LLM':
    default:
      badgeStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      Icon = Cpu;
      label = 'Google Gemini LLM';
      break;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Origin Source Badge */}
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-semibold tracking-wide ${badgeStyle}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>Source: {label}</span>
      </span>

      {/* Latency badge */}
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px]">
        <Clock className="w-3 h-3 text-slate-500" />
        <span>{responseTimeMs} ms</span>
      </span>

      {/* Tokens Saved badge */}
      {tokensSaved > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-semibold text-[11px]">
          <Sparkles className="w-3 h-3" />
          <span>+{tokensSaved} Tokens Saved</span>
        </span>
      )}

      {/* Similarity Score tag if vector database match */}
      {similarityScore !== undefined && source === 'Vector Database' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium text-[11px]">
          <span>Similarity: {similarityScore}%</span>
        </span>
      )}
    </div>
  );
}
