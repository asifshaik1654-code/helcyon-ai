import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { mockProfile, mockNotifications } from '../../data/mockData';
import { TransactionFormModal } from '../transactions/TransactionFormModal';
import { CSVImportModal } from '../transactions/CSVImportModal';
import { fetchNotifications, markNotificationAsRead } from '../../services/notificationService';
import { importTransactions, createTransaction } from '../../services/transactionService';
import type { InAppNotification, Transaction } from '../../types';

interface DashboardLayoutProps {
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  currency: string;
  onChangeCurrency: (curr: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  isDemoMode,
  onToggleDemoMode,
  currency,
  onChangeCurrency,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>(mockNotifications);

  useEffect(() => {
    let isMounted = true;
    async function loadNotifs() {
      try {
        const res = await fetchNotifications();
        if (isMounted && res.notifications) {
          const mapped: InAppNotification[] = res.notifications.map((n) => ({
            id: n.id,
            userId: '00000000-0000-0000-0000-000000000001',
            title: n.title,
            message: n.message,
            notificationType: n.type.startsWith('budget')
              ? 'budget'
              : n.type.startsWith('bill')
              ? 'recurring'
              : 'milestone',
            isRead: n.isRead,
            createdAt: n.createdAt,
          }));
          setNotifications(mapped);
        }
      } catch (err) {
        // Fall back gracefully to mock notifications
        console.debug('[DashboardLayout] Live notifications offline, using fallback');
      }
    }
    loadNotifs();
    const handleSaveQuickTransaction = async (data: Partial<Transaction>) => {
    try {
      await createTransaction(data as any);
    } catch (err) {
      console.error('[DashboardLayout] Failed to save transaction:', err);
    } finally {
      setIsAddTransactionOpen(false);
    }
  };

  return () => {
      isMounted = false;
    };
  }, []);

  const location = useLocation();

  // Map path to human-readable title
  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/dashboard':
        return 'Financial Overview';
      case '/transactions':
        return 'Transaction Ledger';
      case '/budgets':
        return 'Budget Planner';
      case '/savings':
        return 'Savings Goals';
      case '/recurring':
        return 'Recurring Intelligence';
      case '/insights':
        return 'Spending Insights & Anomalies';
      case '/assistant':
        return 'Helcyon AI Assistant';
      case '/simulator':
        return 'What-If Simulator';
      case '/reports':
        return 'Monthly Financial Reports';
      case '/calendar':
        return 'Financial Calendar';
      case '/settings':
        return 'Account & Preferences';
      default:
        return 'Financial Intelligence';
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markNotificationAsRead(id);
    } catch {
      // Ignored if offline
    }
  };

  const handleSaveQuickTransaction = async (data: Partial<Transaction>) => {
    try {
      await createTransaction(data as any);
    } catch (err) {
      console.error('[DashboardLayout] Failed to save transaction:', err);
    } finally {
      setIsAddTransactionOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0E17] text-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isDemoMode={isDemoMode}
          onToggleDemoMode={onToggleDemoMode}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64">
            <Sidebar
              onCloseMobile={() => setMobileSidebarOpen(false)}
              isDemoMode={isDemoMode}
              onToggleDemoMode={onToggleDemoMode}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          pageTitle={getPageTitle(location.pathname)}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
          onOpenCSVImport={() => setIsCSVImportOpen(true)}
          currency={currency}
          onChangeCurrency={onChangeCurrency}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          userName={mockProfile.fullName}
          userEmail={mockProfile.email}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <TransactionFormModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onSave={handleSaveQuickTransaction}
      />

      <CSVImportModal
        isOpen={isCSVImportOpen}
        onClose={() => setIsCSVImportOpen(false)}
        onImportSuccess={async (rows) => {
          try {
            await importTransactions(rows);
          } catch (err) {
            console.error('[DashboardLayout CSV import error]:', err);
          } finally {
            setIsCSVImportOpen(false);
          }
        }}
      />
    </div>
  );
};

