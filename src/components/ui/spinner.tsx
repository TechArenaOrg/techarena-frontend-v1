import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}

// A rotating "comet" ring instead of a flat, uniformly-grey stroke - the gradient
// tail is what makes it read as alive rather than static geometry spinning in
// place. Colored via currentColor (add a text-* class, e.g. text-primary for the
// brand blue) so it still contrasts correctly when it lands inside a colored
// button instead of standing alone. Falls back to a gentle pulse under
// prefers-reduced-motion instead of stopping outright, so it still reads as
// "working."
export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-block animate-spin rounded-full motion-reduce:animate-pulse', className)}
      style={{
        background: 'conic-gradient(from 0deg, transparent 0%, transparent 55%, currentColor 100%)',
        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))',
        mask: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))',
      }}
    />
  );
}
