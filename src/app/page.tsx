
'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect } from 'react';

function SplashScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

function WelcomeForm() {
  const router = useRouter();

  const handleNameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', name);
    }
    router.push(`/dashboard?name=${encodeURIComponent(name)}`);
  };

  return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="mx-auto w-full max-w-sm border-0 bg-card">
          <CardHeader className="space-y-4 text-center">
            <div>
              <CardTitle className="text-2xl">Welcome to FinanceFlow</CardTitle>
              <CardDescription>
                Enter your name to continue to your dashboard.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" defaultValue="Mayur Malaviya" />
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
  );
}

export default function WelcomePage() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }
  
  return <WelcomeForm />;
}
