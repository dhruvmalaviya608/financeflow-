
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function WelcomePage() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      router.push(`/dashboard?name=${encodeURIComponent(name.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 to-background dark:from-violet-900/20 dark:to-background p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleContinue}>
          <CardHeader>
            <CardTitle>Welcome to FinanceFlow</CardTitle>
            <CardDescription>Your personal finance tracker. Let's get started by telling us your name.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
