-- ==============================================================================
-- HELCYON AI: FINANCIAL INTELLIGENCE
-- Synthetic Demo Seed Data for Presentation & Evaluation
-- ==============================================================================

-- Note: In a live Supabase environment, create the demo user via Supabase Auth first,
-- or use the UUID below if inserting directly in development.
DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
  goal_emergency_id UUID := '11111111-1111-1111-1111-111111111111';
  goal_laptop_id UUID := '22222222-2222-2222-2222-222222222222';
  goal_travel_id UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
  -- 1. Upsert Profile
  INSERT INTO public.profiles (id, full_name, preferred_currency, monthly_income, onboarding_completed)
  VALUES (demo_user_id, 'Shaik Asif (Demo Account)', 'INR', 85000.00, TRUE)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    monthly_income = EXCLUDED.monthly_income;

  -- 2. Clear previous demo data for clean idempotent re-run
  DELETE FROM public.transactions WHERE user_id = demo_user_id;
  DELETE FROM public.budgets WHERE user_id = demo_user_id;
  DELETE FROM public.savings_contributions WHERE user_id = demo_user_id;
  DELETE FROM public.savings_goals WHERE user_id = demo_user_id;
  DELETE FROM public.recurring_payments WHERE user_id = demo_user_id;
  DELETE FROM public.financial_insights WHERE user_id = demo_user_id;
  DELETE FROM public.notifications WHERE user_id = demo_user_id;

  -- 3. Seed Transactions
  INSERT INTO public.transactions (user_id, title, amount, transaction_type, category, transaction_date, payment_method, description, is_recurring)
  VALUES
    (demo_user_id, 'Monthly Tech Salary', 85000.00, 'income', 'Salary', '2026-11-01', 'Bank Transfer', 'Tech Corp payroll deposit', FALSE),
    (demo_user_id, 'Apartment Monthly Rent', 22000.00, 'expense', 'Housing', '2026-11-02', 'Net Banking', 'Monthly rent transfer to landlord', TRUE),
    (demo_user_id, 'Supermarket Groceries & Staples', 4250.00, 'expense', 'Groceries', '2026-11-03', 'UPI', 'Weekly provisions and essentials', FALSE),
    (demo_user_id, 'High-Speed Fiber Broadband', 1199.00, 'expense', 'Utilities', '2026-11-04', 'UPI', '300 Mbps unlimited fiber bill', TRUE),
    (demo_user_id, 'Weekend Bistro Dinner', 2450.00, 'expense', 'Food & Dining', '2026-11-05', 'Credit Card', 'Dinner with college friends', FALSE),
    (demo_user_id, 'Freelance UI/UX Web Project', 18500.00, 'income', 'Freelance', '2026-11-07', 'Bank Transfer', 'FinTech client landing page milestone', FALSE),
    (demo_user_id, 'Electricity Power Bill', 2850.00, 'expense', 'Utilities', '2026-11-08', 'UPI', 'State electricity board residential power bill', TRUE),
    (demo_user_id, 'Metro Smart Card Transit', 1500.00, 'expense', 'Transport', '2026-11-09', 'UPI', 'Monthly transit commute pass recharge', FALSE),
    (demo_user_id, 'Netflix & Spotify Premium', 799.00, 'expense', 'Entertainment', '2026-11-10', 'Credit Card', 'Monthly streaming bundle auto-debit', TRUE),
    (demo_user_id, 'Books & Technical Courses', 1899.00, 'expense', 'Education', '2026-11-11', 'Debit Card', 'Software system architecture tutorials', FALSE),
    (demo_user_id, 'Emergency Medical & Pharmacy', 980.00, 'expense', 'Healthcare', '2026-11-12', 'UPI', 'Prescriptions and medical vitamins', FALSE),
    (demo_user_id, 'AWS Cloud Server & Domain', 1250.00, 'expense', 'Technology', '2026-11-13', 'Credit Card', 'Cloud server hosting & SSL certificates', TRUE);

  -- 4. Seed Monthly Budgets
  INSERT INTO public.budgets (user_id, category, budget_amount, budget_month)
  VALUES
    (demo_user_id, 'Housing', 24000.00, '2026-11'),
    (demo_user_id, 'Food & Dining', 8000.00, '2026-11'),
    (demo_user_id, 'Groceries', 10000.00, '2026-11'),
    (demo_user_id, 'Transport', 4000.00, '2026-11'),
    (demo_user_id, 'Utilities', 5000.00, '2026-11'),
    (demo_user_id, 'Entertainment', 3500.00, '2026-11'),
    (demo_user_id, 'Education', 4000.00, '2026-11'),
    (demo_user_id, 'Shopping', 6000.00, '2026-11');

  -- 5. Seed Savings Goals
  INSERT INTO public.savings_goals (id, user_id, goal_name, target_amount, current_amount, target_date, priority)
  VALUES
    (goal_emergency_id, demo_user_id, 'Emergency Safety Reserve', 200000.00, 145000.00, '2027-04-30', 'high'),
    (goal_laptop_id, demo_user_id, 'MacBook Pro M4 Developer Laptop', 175000.00, 95000.00, '2027-01-15', 'medium'),
    (goal_travel_id, demo_user_id, 'Goa Summer Retreat & Travel', 45000.00, 28000.00, '2027-03-20', 'low');

  -- 6. Seed Savings Contributions
  INSERT INTO public.savings_contributions (user_id, goal_id, amount, contribution_date, note)
  VALUES
    (demo_user_id, goal_emergency_id, 15000.00, '2026-11-02', 'Monthly safety deposit from salary'),
    (demo_user_id, goal_laptop_id, 10000.00, '2026-11-07', 'Freelance client milestone allocation'),
    (demo_user_id, goal_travel_id, 5000.00, '2026-11-08', 'Discretionary weekend savings');

  -- 7. Seed Recurring Payments
  INSERT INTO public.recurring_payments (user_id, title, amount, category, frequency, next_payment_date, status, is_user_confirmed)
  VALUES
    (demo_user_id, 'Apartment Monthly Rent', 22000.00, 'Housing', 'monthly', '2026-12-02', 'active', TRUE),
    (demo_user_id, 'High-Speed Fiber Broadband', 1199.00, 'Utilities', 'monthly', '2026-12-04', 'active', TRUE),
    (demo_user_id, 'Electricity Power Bill', 2850.00, 'Utilities', 'monthly', '2026-12-08', 'active', TRUE),
    (demo_user_id, 'Netflix & Spotify Premium', 799.00, 'Entertainment', 'monthly', '2026-12-10', 'active', TRUE),
    (demo_user_id, 'AWS Cloud Server Hosting', 1250.00, 'Technology', 'monthly', '2026-12-13', 'active', FALSE);

  -- 8. Seed Insights
  INSERT INTO public.financial_insights (user_id, insight_type, title, description, severity, is_read)
  VALUES
    (demo_user_id, 'trend', 'Excellent Savings Rate This Month', 'You have retained 62.1% of your total inflow this month (₹64,323 surplus), outperforming your 3-month trailing average.', 'info', FALSE),
    (demo_user_id, 'budget_warning', 'Dining Budget Approaching 75% Mark', 'Your Food & Dining expenditure stands at ₹2,450 out of your ₹8,000 monthly limit with 17 days remaining in November.', 'warning', FALSE),
    (demo_user_id, 'anomaly', 'Potential Unconfirmed Subscription Detected', 'A recurring charge of ₹1,250 from AWS Cloud Server occurred on the same calendar day for 2 consecutive months. Confirm or dismiss.', 'info', TRUE);

  -- 9. Seed In-App Notifications
  INSERT INTO public.notifications (user_id, title, message, notification_type, is_read)
  VALUES
    (demo_user_id, 'Budget Utilization Alert', 'Housing budget utilized at 91.6% following rent clearance.', 'budget', FALSE),
    (demo_user_id, 'Goal Milestone Reached', 'Emergency Safety Reserve has crossed 72% of its ₹2,00,000 target!', 'milestone', FALSE),
    (demo_user_id, 'Subscription Detected', 'Helcyon detected AWS Cloud Hosting (₹1,250/mo). Click to review.', 'recurring', TRUE);

END $$;

