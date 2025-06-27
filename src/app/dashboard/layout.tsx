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
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </TransactionsProvider>
  );
}
