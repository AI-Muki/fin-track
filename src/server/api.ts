import { Router, Request, Response } from 'express';
import {
  generateSpendingAnalysis,
  explainMonthlyChanges,
  suggestSavingsOpportunities,
  autoCategorizeMerchant,
  answerFinancialQuestion,
  checkRateLimit,
} from './gemini';
import { aiChatSchema } from '../lib/validations';

export const apiRouter = Router();

// Middleware: Check rate limits
apiRouter.use((req: Request, res: Response, next) => {
  const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'anonymous';
  const { allowed, remaining } = checkRateLimit(clientIp);

  res.setHeader('X-RateLimit-Limit', '30');
  res.setHeader('X-RateLimit-Remaining', remaining.toString());

  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before sending more AI requests.',
    });
  }
  next();
});

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 1. Spending Analysis
apiRouter.post('/gemini/analyze', async (req: Request, res: Response) => {
  try {
    const { metrics, currency } = req.body;
    if (!metrics) {
      return res.status(400).json({ error: 'Missing verified financial metrics.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        analysis:
          '💡 *Smart Insight (Local Engine)*: Your current savings rate is ' +
          `${metrics.savingsRateThisMonth}%, and your net savings this month is ` +
          `${metrics.netSavingsThisMonth} ${currency || 'EUR'}. To unlock deep generative AI analysis, ` +
          'ensure GEMINI_API_KEY is active in your AI Studio settings.',
      });
    }

    const analysis = await generateSpendingAnalysis(metrics, currency || 'EUR');
    res.json({ analysis });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate spending analysis';
    console.error('AI Analysis Error:', message);
    res.status(500).json({ error: message });
  }
});

// 2. Month-Over-Month Variance Explanation
apiRouter.post('/gemini/monthly-changes', async (req: Request, res: Response) => {
  try {
    const { metrics, currency } = req.body;
    if (!metrics) {
      return res.status(400).json({ error: 'Missing verified financial metrics.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        explanation:
          `Your monthly spending changed by ${metrics.expensesMonthOverMonthChangePct}%, ` +
          `while income changed by ${metrics.incomeMonthOverMonthChangePct}%. ` +
          `Net savings variance is ${(metrics.netSavingsThisMonth - (metrics.previousMonthIncome - metrics.previousMonthExpenses)).toFixed(2)} ${currency || 'EUR'}.`,
      });
    }

    const explanation = await explainMonthlyChanges(metrics, currency || 'EUR');
    res.json({ explanation });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to explain monthly changes';
    console.error('AI MoM Error:', message);
    res.status(500).json({ error: message });
  }
});

// 3. Savings Opportunities
apiRouter.post('/gemini/savings-opportunities', async (req: Request, res: Response) => {
  try {
    const { metrics, currency, recurringCost } = req.body;
    if (!metrics) {
      return res.status(400).json({ error: 'Missing verified financial metrics.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        opportunities:
          `💡 Top opportunities: Review your recurring subscriptions (${recurringCost || 0} ${currency || 'EUR'}/month). ` +
          `Your top spending category is "${metrics.topSpendingCategories?.[0]?.category || 'Housing'}" ` +
          `at ${metrics.topSpendingCategories?.[0]?.amount || 0} ${currency || 'EUR'}.`,
      });
    }

    const opportunities = await suggestSavingsOpportunities(
      metrics,
      currency || 'EUR',
      recurringCost || 0
    );
    res.json({ opportunities });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate savings opportunities';
    console.error('AI Opportunities Error:', message);
    res.status(500).json({ error: message });
  }
});

// 4. Auto-Categorize Merchant
apiRouter.post('/gemini/categorize', async (req: Request, res: Response) => {
  try {
    const { merchant, amount } = req.body;
    if (!merchant || typeof merchant !== 'string') {
      return res.status(400).json({ error: 'Valid merchant name is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Local keyword matching heuristic fallback
      const m = merchant.toLowerCase();
      let category = 'Other';
      if (/supermarket|grocer|lidl|aldi|rewe|edeka|konzum|market|food|bio/i.test(m)) category = 'Groceries';
      else if (/uber|taxi|metro|bus|train|transit|fuel|gas|shell|bp/i.test(m)) category = 'Transportation';
      else if (/netflix|spotify|disney|cinema|movie|steam|playstation/i.test(m)) category = 'Entertainment';
      else if (/gym|fitness|boulder|health|pharmacy|doctor/i.test(m)) category = 'Health & Fitness';
      else if (/amazon|retail|zara|h&m|ikea|store/i.test(m)) category = 'Shopping & Retail';
      else if (/restaurant|trattoria|cafe|coffee|starbucks|pizza|sushi|bistro/i.test(m)) category = 'Dining & Restaurants';
      else if (/github|aws|google|apple|vercel|cloud|software/i.test(m)) category = 'Software & Tech';
      else if (/rent|landlord|real estate|wohnung|mortgage/i.test(m)) category = 'Housing & Rent';

      return res.json({ category, confidence: 0.85, suggestedTags: [category.toLowerCase()] });
    }

    const result = await autoCategorizeMerchant(merchant, amount);
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to categorize';
    console.error('AI Categorize Error:', message);
    res.status(500).json({ error: message });
  }
});

// 5. Interactive Chat & Q&A
apiRouter.post('/gemini/chat', async (req: Request, res: Response) => {
  try {
    const parseResult = aiChatSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid request' });
    }

    const { message, history } = parseResult.data;
    const { metrics, currency, recentTransactions } = req.body;

    if (!metrics) {
      return res.status(400).json({ error: 'Missing financial context metrics.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply:
          `Based on your records, your current net worth is ${metrics.totalNetWorth} ${currency || 'EUR'}, ` +
          `monthly income is ${metrics.totalIncomeThisMonth} ${currency || 'EUR'}, and expenses are ` +
          `${metrics.totalExpensesThisMonth} ${currency || 'EUR'} (Savings rate: ${metrics.savingsRateThisMonth}%). ` +
          `Your financial health score is ${metrics.financialHealthScore}/100. ` +
          `Connect your GEMINI_API_KEY in Settings to enable natural conversational reasoning!`,
      });
    }

    const reply = await answerFinancialQuestion(
      message,
      metrics,
      currency || 'EUR',
      recentTransactions || [],
      history || []
    );

    res.json({ reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process AI chat';
    console.error('AI Chat Error:', message);
    res.status(500).json({ error: message });
  }
});
