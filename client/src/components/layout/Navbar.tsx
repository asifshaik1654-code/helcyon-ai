import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Plus,
  Upload,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  Info,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { InAppNotification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  pageTitle: string;
  onOpenMobileMenu: () => void;
  onOpenAddTransaction: () => void;
  onOpenCSVImport: () => void;
  currency: string;
  onChangeCurrency: (curr: string) => void;
  notifications: InAppNotification[];
  onMarkNotificationRead: (id: string) => void;
  userName: string;
  userEmail: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  pageTitle,
  onOpenMobileMenu,
  onOpenAddTransaction,
  onOpenCSVImport,
  currency,
  onChangeCurrency,
  notifications,
  onMarkNotificationRead,
  userName,
  userEmail,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#0A0E17]/90 backdrop-blur-md border-b border-[#1E293B] sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">{pageTitle}</h1>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Helcyon</span>
            <span>/</span>
            <span className="text-emerald-400 font-medium">{pageTitle}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Currency, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date Month Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131B2E] border border-slate-800 text-xs text-slate-300">
          <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium">November 2026</span>
        </div>

        {/* Currency Switcher */}
        <button
          onClick={() => onChangeCurrency(currency === 'INR' ? 'USD' : 'INR')}
          className="px-2.5 py-1.5 rounded-lg bg-[#131B2E] border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1"
          title="Toggle currency display"
        >
          <span className="text-emerald-400">{currency === 'INR' ? '₹' : '$'}</span>
          <span>{currency}</span>
        </button>

        {/* CSV Import Quick Button */}
        <button
          onClick={onOpenCSVImport}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131B2E] border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition-colors"
          title="Import bank transactions from CSV"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>Import CSV</span>
        </button>

        {/* Add Transaction Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddTransaction}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#131B2E] border border-transparent hover:border-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0E17]" />
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#131B2E] border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <Badge variant="emerald" size="sm">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">Financial Alerts</span>
              </div>

              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No new notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        notif.isRead
                          ? 'bg-[#0A0E17]/40 border-slate-800 text-slate-400'
                          : 'bg-slate-800/60 border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {notif.notificationType === 'milestone' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : notif.notificationType === 'budget' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-100">{notif.title}</div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#131B2E] border border-transparent hover:border-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-xs">
              {userName.charAt(0)}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#131B2E] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="text-xs font-semibold text-white">{userName}</div>
                <div className="text-[11px] text-slate-400 truncate">{userEmail}</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile & Preferences</span>
                </button>
              </div>
              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
