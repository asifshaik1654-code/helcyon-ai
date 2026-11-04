import React from 'react';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AIInsightBannerProps {
  headline?: string;
  observation?: string;
}

export const AIInsightBanner: React.FC<AIInsightBannerProps> = ({
  headline = 'High Savings Efficiency Detected',
  observation = 'Your November net savings rate is 62.1% (₹64,323 surplus), outpacing your 3-month trailing benchmark. You are on track to fund your Emergency Safety Goal 2 weeks ahead of schedule.',
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#131B2E] to-cyan-950/30 border border-emerald-500/30 p-5 shadow-lg">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Helcyon Intelligence
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                Gemini Powered
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-0.5">{headline}</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">{observation}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/assistant')}
          className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold transition-colors group"
        >
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>Ask Assistant</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
