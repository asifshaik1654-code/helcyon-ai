-- ==============================================================================
-- HELCYON AI: FINANCIAL INTELLIGENCE
-- Migration 003: Performance Optimization & Compound Indexes
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. TRANSACTIONS Indexes
-- Accelerates date-range queries, dashboard recents, and category aggregations
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON public.transactions (user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_category 
ON public.transactions (user_id, category);

CREATE INDEX IF NOT EXISTS idx_transactions_user_type 
ON public.transactions (user_id, transaction_type);

-- 2. BUDGETS Indexes
-- Accelerates month-by-month budget utilization lookups
CREATE INDEX IF NOT EXISTS idx_budgets_user_month 
ON public.budgets (user_id, budget_month);

-- 3. SAVINGS_GOALS & CONTRIBUTIONS Indexes
CREATE INDEX IF NOT EXISTS idx_savings_goals_user 
ON public.savings_goals (user_id);

CREATE INDEX IF NOT EXISTS idx_savings_contributions_goal 
ON public.savings_contributions (goal_id, contribution_date DESC);

-- 4. RECURRING_PAYMENTS Indexes
-- Accelerates upcoming due date calendar queries
CREATE INDEX IF NOT EXISTS idx_recurring_payments_user_next_date 
ON public.recurring_payments (user_id, next_payment_date ASC);

-- 5. NOTIFICATIONS & INSIGHTS Indexes
-- Rapid retrieval of unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications (user_id, is_read) 
WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_insights_user_unread 
ON public.financial_insights (user_id, is_read) 
WHERE is_read = FALSE;
