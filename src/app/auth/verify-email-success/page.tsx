import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Email Verified | TechArena Uganda',
  description: 'Your email has been verified.',
};

export default function VerifyEmailSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">TechArena</h1>
            <p className="text-sm text-muted-foreground mt-1">Uganda's Premier Technology Marketplace</p>
          </Link>
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 mx-auto text-green-600" />
            <div>
              <h2 className="text-lg font-semibold">Email verified</h2>
              <p className="text-muted-foreground mt-1">Your email address has been verified. You can now sign in to your account.</p>
            </div>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
