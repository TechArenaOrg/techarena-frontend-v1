import { Metadata } from 'next';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ResendVerificationForm } from '@/components/auth/resend-verification-form';

export const metadata: Metadata = {
  title: 'Verification Failed | TechArena Uganda',
  description: 'We could not verify your email address.',
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function VerifyEmailErrorPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

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
          <CardContent className="py-10 text-center space-y-4">
            <XCircle className="w-10 h-10 mx-auto text-destructive" />
            <div>
              <h2 className="text-lg font-semibold">Verification failed</h2>
              <p className="text-muted-foreground mt-1">
                {error || 'This verification link is invalid or has expired.'}
              </p>
            </div>
            <div className="pt-2">
              <ResendVerificationForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
