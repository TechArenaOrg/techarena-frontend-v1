import { Metadata } from 'next';
import Link from 'next/link';
import { VerifyEmailSuccess } from '@/components/auth/VerifyEmailSuccess';

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

        <VerifyEmailSuccess />
      </div>
    </div>
  );
}
