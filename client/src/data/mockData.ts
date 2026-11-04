import {
  Transaction,
  Budget,
  SavingsGoal,
  RecurringPayment,
  FinancialInsight,
  InAppNotification,
  UserProfile,
  DashboardSummary
} from '../types';

export const mockProfile: UserProfile = {
  id: 'usr_demo_7890',
  email: 'asif.shaik@helcyon.ai',
  fullName: 'Shaik Asif',
  preferredCurrency: 'INR',
  monthlyIncome: 85000,
  onboardingCompleted: true,
  financialGoals: ['Emergency Fund', 'MacBook Pro M4', 'Goa Vacation'],
  createdAt: '2026-09-01T10:00:00Z',
};

export const mockTransactions: Transaction[] = [
  {
    id: 'tx_01',
    userId: 'usr_demo_7890',
    title: 'Monthly Tech Salary',
    amount: 85000,
    transactionType: 'income',
    category: 'Salary',
    transactionDate: '2026-11-01',
    paymentMethod: 'Bank Transfer',
    description: 'Tech Corp monthly payroll credited',
    createdAt: '2026-11-01T09:30:00Z'
  },
  {
    id: 'tx_02',
    userId: 'usr_demo_7890',
    title: 'Apartment Monthly Rent',
    amount: 22000,
    transactionType: 'expense',
    category: 'Housing',
    transactionDate: '2026-11-02',
    paymentMethod: 'Net Banking',
    description: '2BHK Apartment rent paid to owner',
    isRecurring: true,
    createdAt: '2026-11-02T11:00:00Z'
  },
  {
    id: 'tx_03',
    userId: 'usr_demo_7890',
    title: 'Supermarket Groceries & Staples',
    amount: 4250,
    transactionType: 'expense',
    category: 'Groceries',
    transactionDate: '2026-11-03',
    paymentMethod: 'UPI',
    description: 'Weekly household essentials and provisions',
    createdAt: '2026-11-03T18:45:00Z'
  },
  {
    id: 'tx_04',
    userId: 'usr_demo_7890',
    title: 'High-Speed Fiber Broadband',
    amount: 1199,
    transactionType: 'expense',
    category: 'Utilities',
    transactionDate: '2026-11-04',
    paymentMethod: 'UPI',
    description: 'Airtel 300 Mbps monthly fiber subscription',
    isRecurring: true,
    createdAt: '2026-11-04T14:15:00Z'
  },
  {
    id: 'tx_05',
    userId: 'usr_demo_7890',
    title: 'Weekend Bistro Dinner',
    amount: 2450,
    transactionType: 'expense',
    category: 'Food & Dining',
    transactionDate: '2026-11-05',
    paymentMethod: 'Credit Card',
    description: 'Dinner with college friends at Olive Bistro',
    createdAt: '2026-11-05T21:30:00Z'
  },
  {
    id: 'tx_06',
    userId: 'usr_demo_7890',
    title: 'Freelance UI/UX Web Project',
    amount: 18500,
    transactionType: 'income',
    category: 'Freelance',
    transactionDate: '2026-11-07',
    paymentMethod: 'Bank Transfer',
    description: 'Landing page design milestone for FinTech client',
    createdAt: '2026-11-07T16:00:00Z'
  },
  {
    id: 'tx_07',
    userId: 'usr_demo_7890',
    title: 'Electricity Power Bill',
    amount: 2850,
    transactionType: 'expense',
    category: 'Utilities',
    transactionDate: '2026-11-08',
    paymentMethod: 'UPI',
    description: 'State electricity board residential power bill',
    isRecurring: true,
    createdAt: '2026-11-08T10:20:00Z'
  },
  {
    id: 'tx_08',
    userId: 'usr_demo_7890',
    title: 'Metro Smart Card Commute Recharge',
    amount: 1500,
    transactionType: 'expense',
    category: 'Transport',
    transactionDate: '2026-11-09',
    paymentMethod: 'UPI',
    description: 'Metro rail monthly transit pass',
    createdAt: '2026-11-09T08:10:00Z'
  },
  {
    id: 'tx_09',
    userId: 'usr_demo_7890',
    title: 'Netflix & Spotify Premium',
    amount: 799,
    transactionType: 'expense',
    category: 'Entertainment',
    transactionDate: '2026-11-10',
    paymentMethod: 'Credit Card',
    description: 'Monthly streaming bundle auto-debit',
    isRecurring: true,
    createdAt: '2026-11-10T02:00:00Z'
  },
  {
    id: 'tx_10',
    userId: 'usr_demo_7890',
    title: 'Books & Online Engineering Courses',
    amount: 1899,
    transactionType: 'expense',
    category: 'Education',
    transactionDate: '2026-11-11',
    paymentMethod: 'Debit Card',
    description: 'Full-stack system architecture book & tutorial bundle',
    createdAt: '2026-11-11T13:40:00Z'
  },
  {
    id: 'tx_11',
    userId: 'usr_demo_7890',
    title: 'Emergency Medical & Pharmacy',
    amount: 980,
    transactionType: 'expense',
    category: 'Healthcare',
    transactionDate: '2026-11-12',
    paymentMethod: 'UPI',
    description: 'Prescription medicines and health vitamins',
    createdAt: '2026-11-12T19:00:00Z'
  },
  {
    id: 'tx_12',
    userId: 'usr_demo_7890',
    title: 'AWS Cloud Hosting & Domain',
    amount: 1250,
    transactionType: 'expense',
    category: 'Technology',
    transactionDate: '2026-11-13',
    paymentMethod: 'Credit Card',
    description: 'Cloud VPS server & SSL certificates',
    isRecurring: true,
    createdAt: '2026-11-13T06:00:00Z'
  }
];

export const mockBudgets: Budget[] = [
  { id: 'b_01', userId: 'usr_demo_7890', category: 'Housing', budgetAmount: 24000, budgetMonth: '2026-11' },
  { id: 'b_02', userId: 'usr_demo_7890', category: 'Food & Dining', budgetAmount: 8000, budgetMonth: '2026-11' },
  { id: 'b_03', userId: 'usr_demo_7890', category: 'Groceries', budgetAmount: 10000, budgetMonth: '2026-11' },
  { id: 'b_04', userId: 'usr_demo_7890', category: 'Transport', budgetAmount: 4000, budgetMonth: '2026-11' },
  { id: 'b_05', userId: 'usr_demo_7890', category: 'Utilities', budgetAmount: 5000, budgetMonth: '2026-11' },
  { id: 'b_06', userId: 'usr_demo_7890', category: 'Entertainment', budgetAmount: 3500, budgetMonth: '2026-11' },
  { id: 'b_07', userId: 'usr_demo_7890', category: 'Education', budgetAmount: 4000, budgetMonth: '2026-11' },
  { id: 'b_08', userId: 'usr_demo_7890', category: 'Shopping', budgetAmount: 6000, budgetMonth: '2026-11' },
];

export const mockSavingsGoals: SavingsGoal[] = [
  {
    id: 'sg_01',
    userId: 'usr_demo_7890',
    goalName: 'Emergency Safety Reserve',
    targetAmount: 200000,
    currentAmount: 145000,
    targetDate: '2027-04-30',
    priority: 'high',
    contributions: [
      { id: 'c_01', goalId: 'sg_01', amount: 15000, contributionDate: '2026-11-02', note: 'Monthly safety deposit' }
    ]
  },
  {
    id: 'sg_02',
    userId: 'usr_demo_7890',
    goalName: 'MacBook Pro M4 Developer Laptop',
    targetAmount: 175000,
    currentAmount: 95000,
    targetDate: '2027-01-15',
    priority: 'medium',
    contributions: [
      { id: 'c_02', goalId: 'sg_02', amount: 10000, contributionDate: '2026-11-05', note: 'Freelance allocation' }
    ]
  },
  {
    id: 'sg_03',
    userId: 'usr_demo_7890',
    goalName: 'Goa Summer Retreat & Travel',
    targetAmount: 45000,
    currentAmount: 28000,
    targetDate: '2027-03-20',
    priority: 'low',
    contributions: [
      { id: 'c_03', goalId: 'sg_03', amount: 5000, contributionDate: '2026-11-08', note: 'Weekend savings' }
    ]
  }
];

export const mockRecurringPayments: RecurringPayment[] = [
  {
    id: 'rec_01',
    userId: 'usr_demo_7890',
    title: 'Apartment Monthly Rent',
    amount: 22000,
    category: 'Housing',
    frequency: 'monthly',
    nextPaymentDate: '2026-12-02',
    status: 'active',
    isUserConfirmed: true
  },
  {
    id: 'rec_02',
    userId: 'usr_demo_7890',
    title: 'Airtel Fiber Broadband',
    amount: 1199,
    category: 'Utilities',
    frequency: 'monthly',
    nextPaymentDate: '2026-12-04',
    status: 'active',
    isUserConfirmed: true
  },
  {
    id: 'rec_03',
    userId: 'usr_demo_7890',
    title: 'Electricity Utility Bill',
    amount: 2850,
    category: 'Utilities',
    frequency: 'monthly',
    nextPaymentDate: '2026-12-08',
    status: 'active',
    isUserConfirmed: true
  },
  {
    id: 'rec_04',
    userId: 'usr_demo_7890',
    title: 'Netflix & Spotify Premium',
    amount: 799,
    category: 'Entertainment',
    frequency: 'monthly',
    nextPaymentDate: '2026-12-10',
    status: 'active',
    isUserConfirmed: true
  },
  {
    id: 'rec_05',
    userId: 'usr_demo_7890',
    title: 'AWS Cloud Hosting',
    amount: 1250,
    category: 'Technology',
    frequency: 'monthly',
    nextPaymentDate: '2026-12-13',
    status: 'active',
    isUserConfirmed: false // Detected by system, waiting for user confirmation!
  }
];

export const mockInsights: FinancialInsight[] = [
  {
    id: 'ins_01',
    userId: 'usr_demo_7890',
    insightType: 'trend',
    title: 'Excellent Savings Rate This Month',
    description: 'You have retained 62.1% of your total inflow this month (₹64,323 net cash surplus), which is 14% higher than your 3-month trailing average.',
    severity: 'info',
    isRead: false,
    createdAt: '2026-11-13T10:00:00Z'
  },
  {
    id: 'ins_02',
    userId: 'usr_demo_7890',
    insightType: 'budget_warning',
    title: 'Dining Budget Approaching 75% Mark',
    description: 'Your Food & Dining expenditure stands at ₹2,450 out of your ₹8,000 monthly limit with 17 days remaining in November.',
    severity: 'warning',
    isRead: false,
    createdAt: '2026-11-12T14:30:00Z'
  },
  {
    id: 'ins_03',
    userId: 'usr_demo_7890',
    insightType: 'anomaly',
    title: 'Potential Unconfirmed Subscription Detected',
    description: 'A recurring charge of ₹1,250 from AWS Cloud Hosting occurred on the same calendar day for 2 consecutive months. Confirm or dismiss this subscription.',
    severity: 'info',
    isRead: true,
    createdAt: '2026-11-11T09:15:00Z'
  }
];

export const mockNotifications: InAppNotification[] = [
  {
    id: 'notif_01',
    userId: 'usr_demo_7890',
    title: 'Budget Alert',
    message: 'Housing budget utilized at 91.6% following rent clearance.',
    notificationType: 'budget',
    isRead: false,
    createdAt: '2026-11-02T11:05:00Z'
  },
  {
    id: 'notif_02',
    userId: 'usr_demo_7890',
    title: 'Goal Milestone Achieved',
    message: 'Emergency Safety Reserve has crossed 72% of its ₹2,00,000 goal!',
    notificationType: 'milestone',
    isRead: false,
    createdAt: '2026-11-02T12:00:00Z'
  },
  {
    id: 'notif_03',
    userId: 'usr_demo_7890',
    title: 'New Subscription Detected',
    message: 'Helcyon detected AWS Cloud Hosting (₹1,250/mo). Click to review.',
    notificationType: 'recurring',
    isRead: true,
    createdAt: '2026-11-10T08:00:00Z'
  }
];

export const mockMonthlyTrends = [
  { month: 'Jun 2026', income: 78000, expenses: 36200, savings: 41800 },
  { month: 'Jul 2026', income: 82000, expenses: 39500, savings: 42500 },
  { month: 'Aug 2026', income: 85000, expenses: 44100, savings: 40900 },
  { month: 'Sep 2026', income: 80000, expenses: 38700, savings: 41300 },
  { month: 'Oct 2026', income: 94000, expenses: 41200, savings: 52800 },
  { month: 'Nov 2026', income: 103500, expenses: 39177, savings: 64323 },
];

