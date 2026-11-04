-- ==============================================================================
-- HELCYON AI: FINANCIAL INTELLIGENCE
-- Migration 002: Row Level Security (RLS) Enforcement Policies
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Enable RLS on Every Financial Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. PROFILES Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 3. TRANSACTIONS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
ON public.transactions FOR DELETE
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. BUDGETS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets"
ON public.budgets FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets"
ON public.budgets FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets"
ON public.budgets FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets"
ON public.budgets FOR DELETE
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. SAVINGS_GOALS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own savings goals" ON public.savings_goals;
CREATE POLICY "Users can view own savings goals"
ON public.savings_goals FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own savings goals" ON public.savings_goals;
CREATE POLICY "Users can insert own savings goals"
ON public.savings_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own savings goals" ON public.savings_goals;
CREATE POLICY "Users can update own savings goals"
ON public.savings_goals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own savings goals" ON public.savings_goals;
CREATE POLICY "Users can delete own savings goals"
ON public.savings_goals FOR DELETE
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. SAVINGS_CONTRIBUTIONS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own savings contributions" ON public.savings_contributions;
CREATE POLICY "Users can view own savings contributions"
ON public.savings_contributions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own savings contributions" ON public.savings_contributions;
CREATE POLICY "Users can insert own savings contributions"
ON public.savings_contributions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own savings contributions" ON public.savings_contributions;
CREATE POLICY "Users can delete own savings contributions"
ON public.savings_contributions FOR DELETE
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 7. RECURRING_PAYMENTS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own recurring payments" ON public.recurring_payments;
CREATE POLICY "Users can view own recurring payments"
ON public.recurring_payments FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recurring payments" ON public.recurring_payments;
CREATE POLICY "Users can insert own recurring payments"
ON public.recurring_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recurring payments" ON public.recurring_payments;
CREATE POLICY "Users can update own recurring payments"
ON public.recurring_payments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recurring payments" ON public.recurring_payments;
CREATE POLICY "Users can delete own recurring payments"
ON public.recurring_payments FOR DELETE
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. FINANCIAL_INSIGHTS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own financial insights" ON public.financial_insights;
CREATE POLICY "Users can view own financial insights"
ON public.financial_insights FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own financial insights" ON public.financial_insights;
CREATE POLICY "Users can update own financial insights"
ON public.financial_insights FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own financial insights" ON public.financial_insights;
CREATE POLICY "Users can delete own financial insights"
ON public.financial_insights FOR DELETE
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9. NOTIFICATIONS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 10. USER_PREFERENCES Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
