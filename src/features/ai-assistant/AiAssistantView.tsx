import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  TrendingDown,
  ArrowRightLeft,
  Lightbulb,
  ShieldCheck,
  Bot,
  User as UserIcon,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useData } from '@/src/features/data/DataContext';
import { useAuth } from '@/src/features/auth/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
  canRetry?: boolean;
  failedPrompt?: string;
}

function cleanAiResponse(text: unknown, fallback: string): string {
  if (!text) return fallback;
  if (typeof text === 'string') {
    try {
      const parsed = JSON.parse(text);
      if (parsed.error && typeof parsed.error.message === 'string') {
        return parsed.error.message;
      }
      if (typeof parsed.message === 'string') {
        return parsed.message;
      }
    } catch {
      // Return raw string if not JSON
      return text;
    }
    return text;
  }
  return fallback;
}

export const AiAssistantView: React.FC = () => {
  const { metrics, transactions, subscriptions } = useData();
  const { currency } = useAuth();

  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [analysisTitle, setAnalysisTitle] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content:
        `Hello! I'm your FinTrack AI Advisor. I have access to your verified financial ledger for this month: ` +
        `Net worth: ${metrics.totalNetWorth} ${currency}, Monthly savings rate: ${metrics.savingsRateThisMonth}%, ` +
        `and Health score: ${metrics.financialHealthScore}/100. How can I assist you with your budgeting, debt, or savings today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // 1. Spending Analysis
  const handleAnalyzeSpending = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisTitle('Comprehensive Spending & Budget Analysis');
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, currency }),
      });
      const data = await res.json();
      setActiveAnalysis(cleanAiResponse(data.analysis || data.error, 'No analysis generated.'));
    } catch (e: unknown) {
      setActiveAnalysis('Failed to contact AI service. Please check network connectivity.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // 2. Explain Month-Over-Month Changes
  const handleExplainChanges = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisTitle('Month-Over-Month Variance Breakdown');
    try {
      const res = await fetch('/api/gemini/monthly-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, currency }),
      });
      const data = await res.json();
      setActiveAnalysis(cleanAiResponse(data.explanation || data.error, 'No explanation generated.'));
    } catch (e: unknown) {
      setActiveAnalysis('Failed to contact AI service. Please check network connectivity.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // 3. Savings Opportunities
  const handleSavingsOpportunities = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisTitle('Targeted Savings & Leakage Reduction');
    try {
      const recurringCost = subscriptions
        .filter((s) => s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0);

      const res = await fetch('/api/gemini/savings-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, currency, recurringCost }),
      });
      const data = await res.json();
      setActiveAnalysis(cleanAiResponse(data.opportunities || data.error, 'No suggestions generated.'));
    } catch (e: unknown) {
      setActiveAnalysis('Failed to contact AI service. Please check network connectivity.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Send message to AI endpoint
  const sendQuery = async (userText: string) => {
    setIsSending(true);

    try {
      const historyPayload = messages
        .filter((m) => !m.isError)
        .slice(-4)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
          metrics,
          currency,
          recentTransactions: transactions.slice(0, 15),
        }),
      });

      const data = await res.json();
      const isFailed = !res.ok && !data.reply;
      const rawText = data.reply || data.error || "I'm having trouble analyzing your request.";
      const cleaned = cleanAiResponse(rawText, "I'm having trouble analyzing your request.");

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: cleaned,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: isFailed,
        canRetry: isFailed,
        failedPrompt: isFailed ? userText : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: unknown) {
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: 'Unable to reach the AI engine right now. Please check your connection or retry in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        canRetry: true,
        failedPrompt: userText,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Chat message submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    await sendQuery(userText);
  };

  const handleRetryPrompt = (failedPrompt?: string) => {
    if (!failedPrompt || isSending) return;
    sendQuery(failedPrompt);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              FinTrack AI Advisor
            </h1>
            <Badge variant="info">Gemini 3.8 Flash</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Grounded in your real financial transactions and verified balance calculations
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Hallucination-free verified data pipeline</span>
        </div>
      </div>

      {/* One-click Action Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleAnalyzeSpending}
          disabled={isLoadingAnalysis}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-sm text-left transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Analyze Spending
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Deep dive into category distribution & budget risks
          </p>
        </button>

        <button
          onClick={handleExplainChanges}
          disabled={isLoadingAnalysis}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-sm text-left transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Explain Monthly Changes
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Month-over-month variances and trajectory
          </p>
        </button>

        <button
          onClick={handleSavingsOpportunities}
          disabled={isLoadingAnalysis}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-sm text-left transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Savings Opportunities
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Identify recurring subscription leaks and trims
          </p>
        </button>
      </div>

      {/* Generated Report Card (If active) */}
      {(isLoadingAnalysis || activeAnalysis) && (
        <Card className="p-6 bg-slate-50/50 dark:bg-slate-900/60 border-indigo-200 dark:border-indigo-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {analysisTitle}
              </h3>
            </div>
            <button
              onClick={() => setActiveAnalysis(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="pt-4">
            {isLoadingAnalysis ? (
              <div className="flex items-center gap-3 py-6 justify-center text-slate-500 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Generating verified financial briefing with Gemini...</span>
              </div>
            ) : (
              <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
                {activeAnalysis}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Interactive Chat Console */}
      <Card className="p-0 overflow-hidden flex flex-col h-[520px]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                FinTrack Financial Intelligence
              </h3>
              <span className="text-[10px] text-slate-500">
                Safe Q&A • Grounded in {transactions.length} transactions
              </span>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${
                m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                  m.role === 'user'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : m.isError
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900 rounded-tl-none whitespace-pre-line'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {m.content}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-slate-400">
                    {m.timestamp}
                  </span>
                  {m.canRetry && m.failedPrompt && (
                    <button
                      type="button"
                      onClick={() => handleRetryPrompt(m.failedPrompt)}
                      disabled={isSending}
                      className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white shrink-0 flex items-center justify-center text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Consulting financial records...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
        >
          <input
            id="ai-chat-input"
            type="text"
            placeholder="Ask anything: e.g. How much did I spend on groceries? Can I afford a €500 flight?"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSending}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!inputMessage.trim() || isSending}
            className="h-9 px-3"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </Card>
    </div>
  );
};
