// Core Data Types for Helcyon AI

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'UPI' 
  | 'Credit Card' 
  | 'Debit Card' 
  | 'Net Banking' 
  | 'Cash' 
  | 'Bank Transfer' 
  | 'Other';

export type ExpenseCategory =
  | 'Housing'
  | 'Food & Dining'
  | 'Groceries'
  | 'Transport'
  | 'Utilities'
  | 'Shopping'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Technology'
  | 'Personal Care'
  | 'Travel'
  | 'Investments'
  | 'Other';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Investments'
  | 'Gift'
  | 'Rental Income'
  | 'Refund'
  | 'Other';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  transactionType: TransactionType;
  category: TransactionCategory;
  transactionDate: string; // ISO date YYYY-MM-DD
  paymentMethod: PaymentMethod;
  description?: string;
  isRecurring?: boolean;
  createdAt?: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: ExpenseCategory;
  budgetAmount: number;
  budgetMonth: string; // Format: YYYY-MM
  createdAt?: string;
}

export interface BudgetProgress extends Budget {
  spent: number;
  remaining: number;
  utilizationPercentage: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number;
  contributionDate: string;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
  contributions?: SavingsContribution[];
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringPayment {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  frequency: RecurringFrequency;
  nextPaymentDate: string;
  status: 'active' | 'paused' | 'cancelled';
  isUserConfirmed: boolean;
  previousDates?: string[];
}

export type InsightSeverity = 'info' | 'warning' | 'critical';

export interface FinancialInsight {
  id: string;
  userId: string;
  insightType: 'anomaly' | 'budget_warning' | 'savings_milestone' | 'trend';
  title: string;
  description: string;
  severity: InsightSeverity;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  preferredCurrency: string; // e.g. 'INR', 'USD', 'EUR'
  monthlyIncome?: number;
  onboardingCompleted: boolean;
  financialGoals?: string[];
  createdAt?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: 'budget' | 'recurring' | 'anomaly' | 'system' | 'milestone';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  totalSaved: number;
  savingsRate: number; // percentage
  monthlyBudget: {
    totalBudget: number;
    totalSpent: number;
    utilizationRate: number;
  };
  recentTransactions: Transaction[];
  topExpenseCategories: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }[];
  monthlyTrends: {
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }[];
}

export interface SimulationParams {
  incomeChange: number;
  rentChange: number;
  discretionaryChange: number; // Food, Shopping, Entertainment
  newRecurringExpense: number;
  additionalSavings: number;
}
