'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { ordersAPI } from '@/services/api/orders-api';
import { ApiError } from '@/services/api/client';

export function ResendConfirmationButton({ orderId }: { orderId: string }) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    try {
      const { sent } = await ordersAPI.resendConfirmation(orderId);
      toast({
        title: sent ? 'Confirmation email resent' : 'Resend attempted',
        description: sent ? undefined : "The backend accepted the request but didn't confirm it was sent - check the customer's inbox.",
      });
    } catch (err) {
      toast({
        title: 'Resend failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleResend} disabled={isSending}>
      {isSending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      {isSending ? 'Sending...' : 'Resend Confirmation Email'}
    </Button>
  );
}
