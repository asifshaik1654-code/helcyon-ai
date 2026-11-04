import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Repeat,
  Sparkles,
  Bot,
  SlidersHorizontal,
  FileSpreadsheet,
  Calendar,
  Settings,
  ShieldCheck,
  ChevronRight,
  Database
} from 'lucide-react';
import { cn } from '../../utils/formatters';

interface SidebarProps {
  onCloseMobile?: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Budget Planner', path: '/budgets', icon: PieChart },
  { name: 'Savings Goals', path: '/savings', icon: Target },
  { name: 'Recurring Bills', path: '/recurring', icon: Repeat },
  { name: 'Insights & Anomaly', path: '/insights', icon: Sparkles },
  { name: 'AI Assistant', path: '/assistant', icon: Bot, isAIBadge: true },
  { name: 'What-If Simulator', path: '/simulator', icon: SlidersHorizontal },
  { name: 'Monthly Reports', path: '/reports', icon: FileSpreadsheet },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  onCloseMobile,
  isDemoMode,
  onToggleDemoMode,
}) => {
  return (
    <aside className="w-64 h-screen bg-[#0A0E17] border-r border-[#1E293B] flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1E293B]">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors shadow-sm shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">Helcyon</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Financial Clarity</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-[#131B2E] text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B2E]/60 border border-transparent'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.isAIBadge ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                        Gemini
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Demo Mode Pill */}
      <div className="p-4 border-t border-[#1E293B] space-y-3 bg-[#0A0E17]/80">
        <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-[#131B2E] border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">Demo Data</span>
          </div>
          <button
            type="button"
            onClick={onToggleDemoMode}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              isDemoMode ? 'bg-emerald-500' : 'bg-slate-700'
            )}
            title="Toggle between fictional demo data and empty account"
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                isDemoMode ? 'translate-x-4' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        <div className="text-[11px] text-center text-slate-500">
          Helcyon AI v1.0 • BTech Project
        </div>
      </div>
    </aside>
  );
};

