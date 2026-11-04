import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SavingsPage } from './pages/SavingsPage';
import { RecurringPage } from './pages/RecurringPage';
import { InsightsPage } from './pages/InsightsPage';
import { AssistantPage } from './pages/AssistantPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ReportsPage } from './pages/ReportsPage';
import { CalendarPage } from './pages/CalendarPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [currency, setCurrency] = useState('INR');

  const handleToggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const handleChangeCurrency = (newCurr: string) => {
    setCurrency(newCurr);
  };

  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Marketing & Authentication Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Authenticated Application Shell */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout
                  isDemoMode={isDemoMode}
                  onToggleDemoMode={handleToggleDemoMode}
                  currency={currency}
                  onChangeCurrency={handleChangeCurrency}
                />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={<DashboardPage isDemoMode={isDemoMode} currency={currency} />}
            />
            <Route
              path="/transactions"
              element={<TransactionsPage isDemoMode={isDemoMode} currency={currency} />}
            />
            <Route
              path="/budgets"
              element={<BudgetsPage isDemoMode={isDemoMode} currency={currency} />}
            />
            <Route
              path="/savings"
              element={<SavingsPage isDemoMode={isDemoMode} currency={currency} />}
            />
            <Route
              path="/recurring"
              element={<RecurringPage isDemoMode={isDemoMode} currency={currency} />}
            />
            <Route
              path="/insights"
              element={<InsightsPage isDemoMode={isDemoMode} />}
            />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  isDemoMode={isDemoMode}
                  onToggleDemoMode={handleToggleDemoMode}
                  currency={currency}
                  onChangeCurrency={handleChangeCurrency}
                />
              }
            />
          </Route>

          {/* Fallback 404 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
