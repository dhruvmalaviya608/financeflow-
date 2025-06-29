
'use client';

import { useSettings } from '@/context/settings-context';
import { useTransactions } from '@/context/transactions-context';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Download, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AppSidebar from '@/components/layout/app-sidebar';
import KeyboardShortcutsDialog from '@/components/layout/keyboard-shortcuts-dialog';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function SettingsPage() {
  const { isPasswordRequired, setIsPasswordRequired, isLoginEnabled, setIsLoginEnabled } = useSettings();
  const { transactions } = useTransactions();

  const handleExport = () => {
    const formattedTransactions = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description,
      Amount: t.amount,
      Currency: t.currency,
      Type: t.type,
      Category: t.category,
      Account: t.account,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedTransactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "FinanceFlow_Transactions.xlsx");
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
              <AppSidebar />
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-semibold">Settings</h1>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <KeyboardShortcutsDialog />
          </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="grid gap-4 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Manage your security and login settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="login-page-switch" className="font-medium">
                    Show Login Page on Startup
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    If disabled, the app will open directly to the dashboard.
                  </p>
                </div>
                <Switch
                  id="login-page-switch"
                  checked={isLoginEnabled}
                  onCheckedChange={setIsLoginEnabled}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="password-switch" className="font-medium">
                    Require Password on Login
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    If disabled, you can log in without entering a password.
                  </p>
                </div>
                <Switch
                  id="password-switch"
                  checked={isLoginEnabled && isPasswordRequired}
                  onCheckedChange={setIsPasswordRequired}
                  disabled={!isLoginEnabled}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export your transaction data to an Excel file.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
