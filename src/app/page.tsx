'use client';

import { Eye, EyeOff, Package } from 'lucide-react';
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
import { QRCodeCanvas } from 'qrcode.react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(window.location.href);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;

    if (isSignUp) {
      // For a prototype, signing up will just log the user in directly.
      // A real app would have a more complex registration flow.
      console.log('Signing up with:', { name, password });
      router.push(`/dashboard?name=${encodeURIComponent(name)}`);
    } else {
      // Login logic
      if (password === '1234') {
        router.push(`/dashboard?name=${encodeURIComponent(name)}`);
      } else {
        setError('Incorrect password. Please try again.');
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm border-0 bg-card">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create an Account' : 'Welcome to FinanceFlow'}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? 'Enter your details to get started.'
                : 'Enter your credentials to access your dashboard.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" defaultValue="Mayur Malaviya" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" required autoComplete="email" defaultValue="mayurmalaviya54@gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  defaultValue={isSignUp ? "" : "1234"}
                  placeholder={isSignUp ? "Create a password" : ""}
                />
                 <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {error && (
                <p className="pt-1 text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button onClick={() => { setIsSignUp(false); setError(null); }} className="underline">
                  Login
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => { setIsSignUp(true); setError(null); }} className="underline">
                  Sign up
                </button>
              </>
            )}
          </div>

          {url && (
            <div className="mt-6 flex flex-col items-center gap-4 border-t pt-6">
              <div className="p-3 bg-white rounded-lg">
                <QRCodeCanvas value={url} size={128} />
              </div>
              <p className="text-sm text-muted-foreground">Scan to open on your phone</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
