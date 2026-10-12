'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { emailAPI } from '@/services/api/email-api';
import { ApiError } from '@/services/api/client';

export function TestEmailForm({ defaultEmail }: { defaultEmail?: string }) {
  const [to, setTo] = useState(defaultEmail ?? '');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ sent: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsSending(true);
    try {
      const response = await emailAPI.sendTest(to.trim());
      setResult(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {result && (
        <Alert variant={result.sent ? 'success' : 'destructive'}>
          <AlertDescription>
            {result.sent
              ? `Test email sent to ${to}.`
              : "The backend accepted the request but didn't confirm it was sent - check the email configuration."}
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="to">Send test email to</Label>
        <Input
          id="to"
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={isSending}
        />
      </div>
      <Button type="submit" disabled={isSending || !to.trim()}>
        {isSending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        {isSending ? 'Sending...' : 'Send Test Email'}
      </Button>
    </form>
  );
}
