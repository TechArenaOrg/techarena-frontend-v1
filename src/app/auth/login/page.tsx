import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { FormSkeleton } from '@/components/ui/skeletons';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | TechArena Uganda',
  description: 'Sign in to your TechArena account to access your dashboard, orders, and more.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">TechArena</h1>
            <p className="text-sm text-muted-foreground mt-1">Uganda's Premier Technology Marketplace</p>
          </Link>
        </div>
        
        <Suspense fallback={<FormSkeleton fields={3} />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}