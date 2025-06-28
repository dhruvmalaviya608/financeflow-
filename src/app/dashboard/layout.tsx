import AppSidebar from '@/components/layout/app-sidebar';
import { TransactionsProvider } from '@/context/transactions-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TransactionsProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 w-full bg-gradient-to-br from-violet-100/80 to-background dark:from-violet-900/20 dark:to-background">
          {children}
        </div>
      </div>
    </TransactionsProvider>
  );
}
