'use client';

import * as React from 'react';
import { Input, InputProps } from '@/components/ui/input';

export interface CurrencyInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  // Raw digits only (e.g. "100000"), no commas - matches what forms already parseFloat() at submit.
  value: string;
  onChange: (rawDigits: string) => void;
}

function formatWithCommas(digits: string): string {
  if (!digits) return '';
  return new Intl.NumberFormat('en-US').format(Number(digits));
}

// Thousand-separated display (e.g. "100,000") over a plain digit-string value, since a
// native type="number" input can't display commas at all. Non-digit characters (including
// pasted commas) are stripped on every change, so the underlying value stays a clean number.
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value.replace(/\D/g, ''));
    };

    return (
      <Input ref={ref} type="text" inputMode="numeric" value={formatWithCommas(value)} onChange={handleChange} {...props} />
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';
