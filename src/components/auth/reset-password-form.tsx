'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { authAPI } from '@/services/api/auth-api';
import { ApiError } from '@/services/api/client';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain an uppercase letter, a lowercase letter, and a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.resetPassword(token, data.password, data.confirmPassword);
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err) {
      // Expired/invalid tokens last 1 hour and come back as a 400 with a message -
      // surface it directly rather than a generic "something went wrong".
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center space-y-3">
          <Icons.alertTriangle className="w-8 h-8 mx-auto text-destructive" />
          <h2 className="text-lg font-semibold">Invalid reset link</h2>
          <p className="text-muted-foreground">
            This link is missing its reset token. Please request a new password reset link.
          </p>
          <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline inline-block pt-2">
            Request a new link
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center space-y-3">
          <Icons.check className="w-8 h-8 mx-auto text-primary" />
          <h2 className="text-lg font-semibold">Password reset</h2>
          <p className="text-muted-foreground">Your password has been reset. Redirecting you to sign in...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Reset your password</CardTitle>
        <CardDescription className="text-center">Choose a new password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {error}{' '}
              <Link href="/auth/forgot-password" className="underline">
                Request a new link
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your new password"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Link href="/auth/login" className="text-sm text-primary hover:underline mx-auto">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
