import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';

export interface FinancialContext {
  fullName?: string;
  currency?: string;
  monthInflow: number;
  monthOutflow: number;
  availableBalance: number;
  savingsRate: number;
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
  budgetLimits: Array<{ category: string; limit: number; spent: number; status: string }>;
  goals: Array<{ goalName: string; target: number; current: number; progress: number }>;
  recentTransactions: Array<{ title: string; amount: number; type: string; category: string; date: string }>;
}

export interface AICategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
  source: 'gemini' | 'rule_fallback';
}

const VALID_CATEGORIES = [
  'Housing',
  'Food & Dining',
  'Groceries',
  'Transport',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Technology',
  'Personal Care',
  'Travel',
  'Investments',
  'Salary',
  'Freelance',
  'Business',
  'Other',
];

// Determine if real Gemini API key is configured
const isGeminiConfigured =
  Boolean(ENV.GEMINI_API_KEY) &&
  !ENV.GEMINI_API_KEY.includes('mock') &&
  !ENV.GEMINI_API_KEY.includes('your-gemini');

let genAI: GoogleGenerativeAI | null = null;
if (isGeminiConfigured) {
  try {
    genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
  } catch (err) {
    console.error('[Gemini Init Error]:', err);
  }
}

/**
 * Rule-based fallback categorization for offline or instant matching
 */
export function ruleBasedCategorization(title: string): AICategorySuggestion {
  const lower = title.toLowerCase();

  if (lower.includes('rent') || lower.includes('flat') || lower.includes('pg') || lower.includes('housing')) {
    return { category: 'Housing', confidence: 0.95, reasoning: 'Identified accommodation or rent keyword', source: 'rule_fallback' };
  }
  if (lower.includes('swiggy') || lower.includes('zomato') || lower.includes('restaurant') || lower.includes('cafe') || lower.includes('dine') || lower.includes('food') || lower.includes('pizza') || lower.includes('burger')) {
    return { category: 'Food & Dining', confidence: 0.92, reasoning: 'Matched dining or food delivery service', source: 'rule_fallback' };
  }
  if (lower.includes('blinkit') || lower.includes('zepto') || lower.includes('instamart') || lower.includes('grocery') || lower.includes('supermarket') || lower.includes('vegetable') || lower.includes('milk')) {
    return { category: 'Groceries', confidence: 0.93, reasoning: 'Matched quick-commerce grocery merchant', source: 'rule_fallback' };
  }
  if (lower.includes('uber') || lower.includes('ola') || lower.includes('metro') || lower.includes('bus') || lower.includes('fuel') || lower.includes('petrol') || lower.includes('auto') || lower.includes('train')) {
    return { category: 'Transport', confidence: 0.94, reasoning: 'Matched public transit or cab service', source: 'rule_fallback' };
  }
  if (lower.includes('electricity') || lower.includes('power') || lower.includes('water') || lower.includes('gas') || lower.includes('broadband') || lower.includes('wifi') || lower.includes('airtel') || lower.includes('jio')) {
    return { category: 'Utilities', confidence: 0.95, reasoning: 'Matched residential recurring utility bill', source: 'rule_fallback' };
  }
  if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('prime') || lower.includes('cinema') || lower.includes('movie') || lower.includes('steam') || lower.includes('gaming')) {
    return { category: 'Entertainment', confidence: 0.96, reasoning: 'Matched digital entertainment subscription', source: 'rule_fallback' };
  }
  if (lower.includes('amazon') || lower.includes('flipkart') || lower.includes('myntra') || lower.includes('clothing') || lower.includes('shoes') || lower.includes('zara')) {
    return { category: 'Shopping', confidence: 0.91, reasoning: 'Matched retail shopping marketplace', source: 'rule_fallback' };
  }
  if (lower.includes('salary') || lower.includes('payroll') || lower.includes('stipend')) {
    return { category: 'Salary', confidence: 0.98, reasoning: 'Matched compensation or payroll deposit', source: 'rule_fallback' };
  }
  if (lower.includes('freelance') || lower.includes('upwork') || lower.includes('client milestone') || lower.includes('consulting')) {
    return { category: 'Freelance', confidence: 0.94, reasoning: 'Matched freelance client payment', source: 'rule_fallback' };
  }
  if (lower.includes('hospital') || lower.includes('pharmacy') || lower.includes('doctor') || lower.includes('medicine') || lower.includes('clinic')) {
    return { category: 'Healthcare', confidence: 0.93, reasoning: 'Matched health or medical provider', source: 'rule_fallback' };
  }
  if (lower.includes('college') || lower.includes('tuition') || lower.includes('course') || lower.includes('udemy') || lower.includes('book') || lower.includes('exam')) {
    return { category: 'Education', confidence: 0.92, reasoning: 'Matched academic or learning expense', source: 'rule_fallback' };
  }

  return { category: 'Other', confidence: 0.5, reasoning: 'General transaction without specific keyword match', source: 'rule_fallback' };
}

/**
 * AI Categorization using Google Gemini API with fallback
 */
export async function suggestCategoryWithGemini(
  title: string,
  amount?: number,
  description?: string
): Promise<AICategorySuggestion> {
  if (!isGeminiConfigured || !genAI) {
    return ruleBasedCategorization(title);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert financial categorization engine for Helcyon AI.
Given this transaction:
- Title: "${title}"
- Amount: ${amount ? '₹' + amount : 'Unknown'}
- Description: "${description || 'None'}"

Select the SINGLE best category from this exact list:
${VALID_CATEGORIES.join(', ')}

Return strictly valid JSON with this format:
{"category": "CategoryName", "confidence": 0.95, "reasoning": "1 sentence explanation"}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (VALID_CATEGORIES.includes(parsed.category)) {
      return {
        category: parsed.category,
        confidence: Number(parsed.confidence) || 0.85,
        reasoning: parsed.reasoning || 'Categorized by Gemini AI',
        source: 'gemini',
      };
    }

    return ruleBasedCategorization(title);
  } catch (err) {
    console.warn('[Gemini Categorization Fallback]:', err);
    return ruleBasedCategorization(title);
  }
}

/**
 * Conversational Financial Assistant using Gemini with Grounded Context
 */
export async function chatWithFinancialAssistant(
  userQuery: string,
  context: FinancialContext,
  history: Array<{ role: 'user' | 'model'; parts: string }> = []
): Promise<{ reply: string; factsUsed: string[]; source: 'gemini' | 'context_engine' }> {
  // If Gemini is configured, use real LLM grounded on user's exact financial context
  if (isGeminiConfigured && genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `You are Helcyon AI, a trustworthy, intelligent, and explainable personal financial intelligence companion.
You are assisting ${context.fullName || 'the user'}.

Here is the user's verified financial context for the current billing cycle:
- Currency: ${context.currency || 'INR (₹)'}
- Month Total Inflow (Income): ₹${context.monthInflow.toLocaleString()}
- Month Total Outflow (Expenses): ₹${context.monthOutflow.toLocaleString()}
- Net Disposable Balance: ₹${context.availableBalance.toLocaleString()}
- Current Savings Rate: ${context.savingsRate}%
- Top Spending Categories: ${context.topCategories
          .map((c) => `${c.category}: ₹${c.amount.toLocaleString()} (${c.percentage}%)`)
          .join(', ')}
- Category Budgets: ${context.budgetLimits
          .map((b) => `${b.category} (Limit: ₹${b.limit.toLocaleString()}, Spent: ₹${b.spent.toLocaleString()}, Status: ${b.status})`)
          .join(', ')}
- Active Savings Goals: ${context.goals
          .map((g) => `${g.goalName} (${g.progress}% funded, ₹${g.current.toLocaleString()} of ₹${g.target.toLocaleString()})`)
          .join(', ')}
- Recent Transactions: ${context.recentTransactions
          .slice(0, 5)
          .map((t) => `${t.date}: ${t.title} (₹${t.amount.toLocaleString()}, ${t.category})`)
          .join('; ')}

Rules for your answers:
1. Always ground your calculations and advice strictly in these numbers. Do not invent balances.
2. Be concise, polite, encouraging, and clear.
3. If asked whether they can afford a purchase, evaluate their disposable surplus (₹${context.availableBalance.toLocaleString()}) and remaining budget. Distinguish estimates from guarantees.
4. Format currency figures with ₹ symbol.
5. End your response with 2 to 3 bullet points under a bold heading "**Verified Data Used:**" listing the specific numbers from their context that informed your answer.
`,
      });

      const chat = model.startChat({
        history: history.map((h) => ({
          role: h.role,
          parts: [{ text: h.parts }],
        })),
      });

      const response = await chat.sendMessage(userQuery);
      const text = response.response.text();

      // Extract facts used
      const factsUsed: string[] = [
        `Month Inflow: ₹${context.monthInflow.toLocaleString()}`,
        `Month Outflow: ₹${context.monthOutflow.toLocaleString()}`,
        `Net Disposable Surplus: ₹${context.availableBalance.toLocaleString()}`,
      ];

      return {
        reply: text,
        factsUsed,
        source: 'gemini',
      };
    } catch (err) {
      console.warn('[Gemini Chat Fallback to Context Engine]:', err);
    }
  }

  // Deterministic Context Engine Fallback (Offline / Demo Mode)
  const q = userQuery.toLowerCase();
  let reply = '';
  let factsUsed: string[] = [];

  if (q.includes('spend') || q.includes('outflow') || q.includes('expenses')) {
    reply = `This month, your total outflow is **₹${context.monthOutflow.toLocaleString()}** across all recorded expenses. Your net disposable balance stands at **₹${context.availableBalance.toLocaleString()}** with a **${context.savingsRate}%** savings rate.`;
    factsUsed = [
      `Total Outflow: ₹${context.monthOutflow.toLocaleString()}`,
      `Total Inflow: ₹${context.monthInflow.toLocaleString()}`,
      `Savings Rate: ${context.savingsRate}%`,
    ];
  } else if (q.includes('highest') || q.includes('top category') || q.includes('most')) {
    if (context.topCategories.length > 0) {
      const top = context.topCategories[0];
      reply = `Your highest expense category is **${top.category}** at **₹${top.amount.toLocaleString()}**, representing **${top.percentage}%** of your total expenses this month.`;
      factsUsed = [`Top Category: ${top.category}`, `Category Outflow: ₹${top.amount.toLocaleString()} (${top.percentage}%)`];
    } else {
      reply = 'You currently have no expenses recorded for this month.';
    }
  } else if (q.includes('afford') || q.includes('can i buy') || q.includes('purchase')) {
    const numbersInQuery = userQuery.match(/\d+[\d,]*/);
    const cost = numbersInQuery ? parseInt(numbersInQuery[0].replace(/,/g, ''), 10) : 15000;

    if (context.availableBalance >= cost) {
      const remainingAfter = context.availableBalance - cost;
      reply = `Yes, you can comfortably afford this purchase of **₹${cost.toLocaleString()}**. Your current net surplus is **₹${context.availableBalance.toLocaleString()}**. After this purchase, you will still have **₹${remainingAfter.toLocaleString()}** remaining in disposable reserves.`;
    } else {
      const deficit = cost - context.availableBalance;
      reply = `A purchase of **₹${cost.toLocaleString()}** exceeds your current monthly surplus of **₹${context.availableBalance.toLocaleString()}** by **₹${deficit.toLocaleString()}**. I recommend pacing this purchase or funding it through your savings milestones.`;
    }
    factsUsed = [
      `Available Balance: ₹${context.availableBalance.toLocaleString()}`,
      `Planned Cost: ₹${cost.toLocaleString()}`,
    ];
  } else if (q.includes('budget') || q.includes('limit') || q.includes('remaining')) {
    const nearLimit = context.budgetLimits.filter((b) => b.status === 'warning' || b.status === 'danger');
    if (nearLimit.length > 0) {
      reply = `You have **${nearLimit.length} category budgets** approaching or exceeding limits: ${nearLimit
        .map((b) => `**${b.category}** (${b.status === 'danger' ? 'Exceeded' : 'Near limit'}, ₹${b.spent.toLocaleString()} of ₹${b.limit.toLocaleString()})`)
        .join(', ')}. Your other category limits are currently on track.`;
    } else {
      reply = `All your category budgets are currently **on track** under the 80% safe threshold limit.`;
    }
    factsUsed = context.budgetLimits.slice(0, 3).map((b) => `${b.category}: ₹${b.spent.toLocaleString()} / ₹${b.limit.toLocaleString()}`);
  } else if (q.includes('goal') || q.includes('savings')) {
    if (context.goals.length > 0) {
      reply = `You are actively tracking **${context.goals.length} savings goals**. Your highest priority goal is **${context.goals[0].goalName}**, which is currently **${context.goals[0].progress}% funded** (₹${context.goals[0].current.toLocaleString()} of ₹${context.goals[0].target.toLocaleString()}).`;
      factsUsed = context.goals.map((g) => `${g.goalName}: ${g.progress}%`);
    } else {
      reply = `You do not have any active savings goals yet. You can create one in the Savings Goal Planner!`;
    }
  } else {
    reply = `I have reviewed your financial ledger for this month. Your total income is **₹${context.monthInflow.toLocaleString()}**, total expenses are **₹${context.monthOutflow.toLocaleString()}**, leaving an available surplus of **₹${context.availableBalance.toLocaleString()}** (${context.savingsRate}% retention). Feel free to ask about your category budgets, specific expenses, or savings goals!`;
    factsUsed = [
      `Inflow: ₹${context.monthInflow.toLocaleString()}`,
      `Outflow: ₹${context.monthOutflow.toLocaleString()}`,
      `Available Surplus: ₹${context.availableBalance.toLocaleString()}`,
    ];
  }

  return {
    reply,
    factsUsed,
    source: 'context_engine',
  };
}

