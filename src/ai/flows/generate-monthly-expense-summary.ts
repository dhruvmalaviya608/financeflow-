'use server';
/**
 * @fileOverview AI flow to generate a summarized report of monthly expenses, highlighting key spending trends and amounts.
 *
 * - generateMonthlyExpenseSummary - A function that generates a summary of monthly expenses.
 * - GenerateMonthlyExpenseSummaryInput - The input type for the generateMonthlyExpenseSummary function.
 * - GenerateMonthlyExpenseSummaryOutput - The return type for the generateMonthlyExpenseSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMonthlyExpenseSummaryInputSchema = z.object({
  month: z.string().describe('The month for which to generate the expense summary (e.g., January, February).'),
  year: z.string().describe('The year for which to generate the expense summary (e.g., 2023, 2024).'),
  userId: z.string().describe('The ID of the user.'),
});
export type GenerateMonthlyExpenseSummaryInput = z.infer<typeof GenerateMonthlyExpenseSummaryInputSchema>;

const GenerateMonthlyExpenseSummaryOutputSchema = z.object({
  summary: z.string().describe('A summarized report of the user\'s monthly expenses, highlighting key spending trends and amounts.'),
});
export type GenerateMonthlyExpenseSummaryOutput = z.infer<typeof GenerateMonthlyExpenseSummaryOutputSchema>;

export async function generateMonthlyExpenseSummary(input: GenerateMonthlyExpenseSummaryInput): Promise<GenerateMonthlyExpenseSummaryOutput> {
  return generateMonthlyExpenseSummaryFlow(input);
}

// Define a tool to get the total expense amount for a specific category and month.
const getCategoryExpenseAmount = ai.defineTool({
  name: 'getCategoryExpenseAmount',
  description: 'Returns the total expense amount for a specific category in a given month and year for a user.',
  inputSchema: z.object({
    userId: z.string().describe('The ID of the user.'),
    month: z.string().describe('The month for which to retrieve the expense amount (e.g., January, February).'),
    year: z.string().describe('The year for which to retrieve the expense amount (e.g., 2023, 2024).'),
    category: z.string().describe('The category of expenses (e.g., Food, Transportation, Utilities).'),
  }),
  outputSchema: z.number().describe('The total expense amount for the specified category in the given month and year.'),
}, async (input) => {
  // TODO: Implement the logic to fetch the expense amount from the database or data source.
  // For now, return a placeholder value.
  console.log(`Fetching expense amount for category ${input.category} in ${input.month}, ${input.year} for user ${input.userId}`);
  return 100; // Placeholder value
});

const prompt = ai.definePrompt({
  name: 'generateMonthlyExpenseSummaryPrompt',
  input: {schema: GenerateMonthlyExpenseSummaryInputSchema},
  output: {schema: GenerateMonthlyExpenseSummaryOutputSchema},
  tools: [getCategoryExpenseAmount],
  system: `You are a financial advisor who helps users understand their spending habits. Generate a concise summary of the user's monthly expenses, highlighting key spending trends and amounts.

  Use the getCategoryExpenseAmount tool to retrieve the total expense amount for different categories in the specified month and year. Be sure to call the tool multiple times, for various categories to get an overview of where the user spends their money.

  The user ID is {{{userId}}}, the month is {{{month}}}, and the year is {{{year}}}.
`,
  prompt: `Generate a summary of my expenses for {{{month}}} {{{year}}}.`, // Simple prompt to trigger the LLM
});

const generateMonthlyExpenseSummaryFlow = ai.defineFlow(
  {
    name: 'generateMonthlyExpenseSummaryFlow',
    inputSchema: GenerateMonthlyExpenseSummaryInputSchema,
    outputSchema: GenerateMonthlyExpenseSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
