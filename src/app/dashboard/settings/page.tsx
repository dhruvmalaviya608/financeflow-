'use client';

import { useSettings } from '@/context/settings-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const { isPasswordRequired, setIsPasswordRequired, isLoginEnabled, setIsLoginEnabled } = useSettings();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <Card className="bg-card/50 dark:bg-card/30 backdrop-blur-xl border border-white/10">
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
    </div>
  );
}
