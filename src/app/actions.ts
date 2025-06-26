'use server';

import { generateMonthlyExpenseSummary } from '@/ai/flows/generate-monthly-expense-summary';

export async function getAiSummaryAction(month: string, year: string) {
  try {
    // In a real app, this would be the logged-in user's ID
    const userId = 'user-123'; 
    const result = await generateMonthlyExpenseSummary({
      month,
      year,
      userId,
    });
    return { summary: result.summary, error: null };
  } catch (e) {
    console.error(e);
    // In production, log this error to a monitoring service
    return { summary: null, error: 'An unexpected error occurred while generating the summary.' };
  }
}
