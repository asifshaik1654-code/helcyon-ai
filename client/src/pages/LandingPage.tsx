import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  PieChart,
  Repeat,
  SlidersHorizontal,
  Lock,
  CheckCircle2,
  TrendingUp,
  Bot
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Top Navigation */}
      <header className="h-20 border-b border-[#1E293B] px-6 sm:px-12 flex items-center justify-between sticky top-0 bg-[#0A0E17]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">Helcyon <span className="text-emerald-400 font-bold">AI</span></span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Financial Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore Demo
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs text-slate-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen FinTech Built for Clarity & Peace of Mind</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Master your money with{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Explainable AI
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal max-w-2xl mx-auto">
            Stop guessing where your money went. Helcyon AI combines exact financial mathematics,
            intelligent budget enforcement, and Google Gemini reasoning into a unified platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Launch Platform (Instant Demo)
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Create Free Account
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Bank Credentials Needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>PostgreSQL Row-Level Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Gemini AI Engine</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Explainable Gemini AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask natural questions like <em>"Can I afford a ₹15,000 phone?"</em> and receive contextual answers backed by verified transaction math.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">What-If Financial Simulator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulate life changes such as higher rent, reducing dining, or saving an extra ₹5,000 to see your real projected balance before making a decision.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Recurring Bill Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects repeat subscriptions and utility bills automatically from transaction history so you never encounter unexpected renewal fees.
            </p>
          </div>
        </div>

        {/* Academic / Engineering Highlight */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131B2E] to-slate-900 border border-slate-800 text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            College BTech Capstone Build
          </span>
          <p className="text-xs text-slate-400">
            Engineered with strict separation of concerns: React 18, Vite, Tailwind CSS, Node.js REST API,
            Supabase PostgreSQL with Row-Level Security, and Google Gemini 1.5/2.0 SDK.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-6 px-6 sm:px-12 text-center text-xs text-slate-500">
        <p>© 2026 Helcyon AI — Financial Intelligence. Designed & Developed by Shaik Asif.</p>
      </footer>
    </div>
  );
};

