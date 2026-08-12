"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../auth/auth-provider";
import {
  Zap,
  Sparkles,
  Database,
  Cpu,
  ArrowRight,
  TrendingDown,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  BarChart3,
  Server,
  User,
  LogOut,
} from "lucide-react";

export function LandingHero() {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top SaaS Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center ">
                TOKEN<span className="text-emerald-400">FLOW</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block -mt-1 tracking-widest uppercase">
                LLM Token Optimization
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a
              href="#features"
              className="hover:text-emerald-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#architecture"
              className="hover:text-emerald-400 transition-colors"
            >
              Architecture
            </a>
            <a
              href="#use-cases"
              className="hover:text-emerald-400 transition-colors"
            >
              Use Cases
            </a>
          </nav>

          {/* Dynamic User Action */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 rounded-xl bg-slate-900 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      user.displayName?.charAt(0).toUpperCase() || (
                        <User className="w-3.5 h-3.5" />
                      )
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
                    {user.displayName}
                  </span>
                </div>
                <Link
                  href="/chat"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <span>Continue to App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner shadow-emerald-500/10">
          <Zap className="w-3.5 h-3.5 fill-emerald-400" />
          <span>Production AI Token Optimization Middleware</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Slash LLM API Costs & Latency by{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            80%+
          </span>
        </h1>

        {/* Hero Description */}
        <p className="mt-6 text-slate-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          TokenFlow sits between your applications and Large Language Models. It
          compresses prompt tokens, checks exact{" "}
          <strong className="text-cyan-400">Upstash Redis KV caches</strong>,
          searches{" "}
          <strong className="text-purple-400">
            Pinecone Semantic Vector DBs
          </strong>
          , and queries Google Gemini only when required.
        </p>

        {/* Dynamic CTA Card Section */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  You are currently authenticated as{" "}
                  <strong>{user.email || user.displayName}</strong>
                </span>
              </div>
              <Link
                href="/chat"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 hover:scale-105"
              >
                <span>Continue to App</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 hover:scale-105"
            >
              <span>Sign In to Try the App</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Live Architecture Flow Preview Card */}
        <div
          id="architecture"
          className="mt-16 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-xl text-left max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Multi-Layer Middleware Pipeline</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Live Pipeline Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Layer 1
              </div>
              <div className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" /> Prompt Optimizer
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strips conversational fluff & informal slang.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Layer 2
              </div>
              <div className="text-sm font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" /> Redis Cache
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sub-20ms KV match for exact normalized queries.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Layer 3
              </div>
              <div className="text-sm font-bold text-purple-400 mb-1 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-purple-400" /> Pinecone Vector
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                768d cosine search matching semantic intent.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Layer 4
              </div>
              <div className="text-sm font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" /> Gemini API
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fallback generator when caching layers miss.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section
        id="features"
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Key Features
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Everything built into TokenFlow to inspect and maximize AI token
            efficiency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Token Reduction Engine
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Strips redundant tokens, normalizes sentence structure, and
              calculates live input tokens in real-time as you type.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Sub-20ms Exact Caching
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Powered by Upstash Redis. Repeated exact prompts return instant
              answers without incurring LLM charges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Pinecone Vector Search
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Uses Gemini 768d embeddings to retrieve semantically matching
              responses for differently worded questions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Live Cost Analytics
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Every message features an expandable Optimization Details panel
              displaying tokens saved, similarity %, and response latency.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Firebase Authentication
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Google OAuth 2.0 & Email/Password authentication with persistent
              sessions and guest demo mode.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Neon Postgres Persistence
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Stores user profiles, chat conversations, and cumulative system
              analytics in serverless Neon PostgreSQL.
            </p>
          </div>
        </div>
      </section>

      {/* Real-World Use Cases */}
      <section
        id="use-cases"
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-800/80"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Real-World Use Cases
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Why modern AI applications deploy TokenFlow middleware
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-left">
            <div className="text-emerald-400 font-bold text-sm mb-2">
              01. Customer Support AI
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Support bots receive thousands of variations of the same 50
              questions every day. TokenFlow serves exact or vector-cached
              answers in milliseconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-left">
            <div className="text-cyan-400 font-bold text-sm mb-2">
              02. High-Traffic Web Apps
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Avoid hitting Gemini/OpenAI rate limits during traffic spikes by
              serving cached responses directly from Upstash Redis.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-left">
            <div className="text-purple-400 font-bold text-sm mb-2">
              03. Enterprise SaaS Cost Control
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Track token consumption per user, compress verbose prompts before
              execution, and keep AI infrastructure bills predictable.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>
          © 2026 TokenFlow. AI Token Optimization Middleware & Demonstration
          Interface.
        </p>
      </footer>
    </div>
  );
}
