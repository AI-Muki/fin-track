import { z } from 'zod';

export const currencyEnum = z.enum(['EUR', 'BAM', 'USD', 'GBP', 'CHF']);
export const accountTypeEnum = z.enum(['bank', 'cash', 'savings', 'credit_card']);
export const transactionTypeEnum = z.enum(['income', 'expense', 'transfer']);
export const billingCycleEnum = z.enum(['monthly', 'yearly']);

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(50, 'Name too long'),
  type: accountTypeEnum,
  currency: currencyEnum,
  balance: z.number().finite('Balance must be a valid number'),
  accountNumber: z.string().max(34, 'Account number too long').optional(),
  institution: z.string().max(50, 'Institution name too long').optional(),
  color: z.string().optional(),
});

export const transactionSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  toAccountId: z.string().optional(),
  amount: z.number().positive('Amount must be greater than zero').finite('Invalid amount'),
  currency: currencyEnum,
  type: transactionTypeEnum,
  category: z.string().min(1, 'Category is required').max(50),
  merchant: z.string().min(1, 'Merchant/Payee is required').max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  tags: z.array(z.string().max(30)).max(10, 'Max 10 tags allowed').optional(),
});

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required').max(50),
  amount: z.number().positive('Budget amount must be positive'),
  currency: currencyEnum,
  period: z.enum(['monthly', 'yearly']).default('monthly'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month format must be YYYY-MM').optional(),
  alertThresholds: z.array(z.number().min(1).max(100)).optional(),
});

export const savingsGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(60),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0, 'Current amount cannot be negative'),
  currency: currencyEnum,
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be YYYY-MM-DD'),
  category: z.string().max(50).optional(),
  color: z.string().optional(),
});
export const goalSchema = savingsGoalSchema;

export const subscriptionSchema = z.object({
  name: z.string().min(1, 'Subscription name is required').max(60),
  amount: z.number().positive('Amount must be positive'),
  currency: currencyEnum,
  billingCycle: billingCycleEnum,
  category: z.string().min(1, 'Category is required').max(50),
  nextPaymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  status: z.enum(['active', 'paused', 'cancelled']).default('active'),
  notes: z.string().max(250).optional(),
});

export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().max(4000),
    })
  ).max(20, 'History too long').optional(),
});
