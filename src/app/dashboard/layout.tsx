import { TransactionsProvider } from '@/context/transactions-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TransactionsProvider>
      <div className="flex min-h-screen w-full bg-background">
        <div className="flex-1 w-full bg-gradient-to-br from-zinc-100 to-background dark:from-violet-900/20 dark:to-background">
          {children}
        </div>
      </div>
    </TransactionsProvider>
  );
}
