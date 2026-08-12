'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/auth-provider';
import { Zap, LogOut, Sparkles, Trash2, User } from 'lucide-react';
import { SystemMetrics } from '@/types';

interface NavbarProps {
  systemMetrics: SystemMetrics;
  onClearChat?: () => void;
}

export function Navbar({ systemMetrics, onClearChat }: NavbarProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand - Clickable -> Landing Page / */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group" title="Return to Landing Page">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                TOKEN<span className="text-emerald-400">FLOW</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block -mt-1 tracking-widest uppercase">
                AI Optimization Middleware
              </span>
            </div>
          </Link>
        </div>

        {/* Quick System Metric Pill */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-400">{systemMetrics.cacheHits}</span> Hits
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold text-teal-400">{systemMetrics.totalTokensSaved.toLocaleString()}</span> Tokens Saved
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-cyan-400">{systemMetrics.totalLLMCallsSaved}</span> LLM Calls Bypassed
          </div>
        </div>

        {/* User Session & Actions */}
        <div className="flex items-center gap-3">
          {onClearChat && (
            <button
              onClick={onClearChat}
              title="Clear current chat"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-xs font-medium flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full rounded-full" />
                  ) : (
                    user.displayName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="text-xs font-semibold text-slate-200 block truncate max-w-[120px]">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium truncate block max-w-[120px]">
                    {user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
