import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Bot, Send, Sparkles, User, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { sendChatMessage } from '../services/aiService';
import { useDashboard } from '../hooks/useDashboard';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  factsUsed?: string[];
}

const suggestedPrompts = [
  'How much did I spend this month?',
  'Which category has the highest expenses?',
  'Can I afford a ₹15,000 phone this month?',
  'How much is remaining in my Food & Dining budget?',
  'What recurring payments are due next week?',
];

export const AssistantPage: React.FC = () => {
  const { data: dashboardData } = useDashboard();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      content:
        'Hello! I am your Helcyon AI financial intelligence companion, powered by Google Gemini. I analyze your verified transactions, budgets, and savings goals in real-time. Ask me anything about your cash flow, affordability, or forecasts.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      factsUsed: [
        `Income: ${formatCurrency(dashboardData?.totalIncome ?? 103500)}`,
        `Expenses: ${formatCurrency(dashboardData?.totalExpenses ?? 39177)}`,
        `Surplus: ${formatCurrency(dashboardData?.availableBalance ?? 64323)}`,
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Maintain conversation history for Gemini multi-turn format
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'user' | 'model'; parts: string }>
  >([]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    setErrorMessage(null);
    const userMsg: Message = {
      id: 'm_' + Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      // Call backend AI endpoint
      const response = await sendChatMessage(text, conversationHistory);

      const assistantMsg: Message = {
        id: 'mb_' + Date.now(),
        sender: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        factsUsed: response.factsUsed,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update multi-turn history
      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', parts: text },
        { role: 'model', parts: response.reply },
      ]);
    } catch (err: unknown) {
      console.error('[AssistantPage handleSend error]:', err);
      const fallbackError =
        err instanceof Error ? err.message : 'Unable to reach the financial intelligence engine.';
      setErrorMessage(fallbackError);

      // Local fallback reply
      const botFallbackMsg: Message = {
        id: 'mb_err_' + Date.now(),
        sender: 'assistant',
        content: `I encountered an issue connecting to the live Gemini assistant. However, based on your current snapshot, your income is ${formatCurrency(
          dashboardData?.totalIncome ?? 103500
        )} and expenses are ${formatCurrency(
          dashboardData?.totalExpenses ?? 39177
        )}, leaving a disposable surplus of ${formatCurrency(
          dashboardData?.availableBalance ?? 64323
        )}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        factsUsed: [
          `Surplus: ${formatCurrency(dashboardData?.availableBalance ?? 64323)}`,
          'Source: Local Snapshot',
        ],
      };
      setMessages((prev) => [...prev, botFallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Helcyon AI Assistant</span>
            <Badge variant="cyan" size="sm">
              Gemini Integrated
            </Badge>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask conversational questions about your cash flow, affordability, and budget forecasts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Window: 3 Columns */}
        <Card className="lg:col-span-3 flex flex-col h-[650px] overflow-hidden">
          <CardHeader className="bg-[#0A0E17]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm">Financial Intelligence Conversation</CardTitle>
                <p className="text-[11px] text-slate-400">
                  Ground truth supplied by verified backend queries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Model Online</span>
            </div>
          </CardHeader>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isAssistant ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                      isAssistant
                        ? 'bg-[#131B2E] border border-slate-700/80 text-slate-100 shadow-md'
                        : 'bg-emerald-600 text-slate-950 font-medium rounded-tr-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Verified Facts Tag Box */}
                    {isAssistant && msg.factsUsed && msg.factsUsed.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block">
                          Verified Calculation Facts:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.factsUsed.map((fact, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#0A0E17] text-slate-300 border border-slate-800 font-mono"
                            >
                              {fact}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      className={`text-[10px] ${
                        isAssistant ? 'text-slate-500 text-right' : 'text-emerald-950/70 text-right'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Gemini is analyzing your verified financial context...</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Suggested Quick Prompts */}
          <div className="p-3 bg-[#0A0E17]/60 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">
              Suggestions:
            </span>
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[#131B2E] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white shrink-0 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3.5 bg-[#0A0E17] border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Helcyon AI about your financial data..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-[#131B2E] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/80 disabled:opacity-50"
              />
              <Button type="submit" variant="primary" size="md" disabled={isTyping || !inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Right Side: Financial Guardrails & Fact Sheet */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AI Engineering Guardrails</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
              <li>• <strong>No Hallucinated Math:</strong> Totals are computed by SQL/Node.js, not by the LLM.</li>
              <li>• <strong>No Regulated Advice:</strong> Does not offer stock picks or tax filings.</li>
              <li>• <strong>Data Security:</strong> Keys stay safely on the backend server.</li>
            </ul>
          </Card>

          <Card className="p-4 space-y-3">
            <span className="text-xs font-semibold text-slate-200">Current Context Snapshot</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Month:</span>
                <span className="font-medium text-slate-200">
                  {dashboardData?.selectedMonth || 'November 2026'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cash Inflow:</span>
                <span className="font-mono text-emerald-400">
                  {formatCurrency(dashboardData?.totalIncome ?? 103500)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cash Outflow:</span>
                <span className="font-mono text-rose-400">
                  {formatCurrency(dashboardData?.totalExpenses ?? 39177)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Net Cushion:</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {formatCurrency(dashboardData?.availableBalance ?? 64323)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Savings Rate:</span>
                <span className="font-mono text-slate-200">
                  {(dashboardData?.savingsRate ?? 62.1).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
