'use client';

import { cn } from '@/lib/utils';

interface FilterChipRowProps {
  label: string;
  options: { value: string; label: string }[];
  activeValue: string;
  onSelect: (value: string) => void;
}

// Single-row horizontal-scroll chip list - used below lg wherever a Select would
// otherwise be the only way to pick a filter value. Keeps a fixed, compact height
// no matter how many options there are, instead of a dropdown that still needs its
// own full-width row even when it only shows one line of text at a time.
export function FilterChipRow({ label, options, activeValue, onSelect }: FilterChipRowProps) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((option) => {
          const active = activeValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                'shrink-0 rounded-full border px-2.5 py-1 text-xs transition-colors',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-muted'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
